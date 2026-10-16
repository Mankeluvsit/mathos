import type { EcologyDefinition } from '../ecology/world.ts';
import { initializeEcology as initialize, stepEcology as step, ecologyMetrics, copyEcology, END as MAX_TICKS, type Ecology as WorldState } from '../ecology/world.ts';

export interface Scheduler {
  request(callback: (time: number) => void): number;
  cancel(id: number): void;
  now(): number;
}
const browserScheduler: Scheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id), now: () => performance.now(),
};
export type RunStatus = 'paused' | 'running' | 'completed' | 'error';
export type Rate = 1 | 10 | 30;

export class EcologyRuntime {
  private state: WorldState;
  private status: RunStatus = 'paused';
  private rate: Rate = 10;
  private error = '';
  private frame: number | null = null;
  private epoch = 0;
  private disposed = false;
  private owners = 0;
  private last: number | null = null;
  private debt = 0;
  private published = -Infinity;
  private listeners = new Set<() => void>();
  private renderers = new Set<() => void>();

  constructor(definition: EcologyDefinition, private scheduler: Scheduler = browserScheduler) {
    this.state = initialize(definition);
  }
  summary() {
    return Object.freeze({ definition: this.state.definition, tick: this.state.tick,
      metrics: Object.freeze(ecologyMetrics(this.state)), status: this.status, rate: this.rate, error: this.error });
  }
  snapshot(): WorldState { return copyEcology(this.state); }
  subscribe(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  subscribeDraw(listener: () => void) { this.renderers.add(listener); return () => { this.renderers.delete(listener); }; }
  private publish() { for (const listener of this.listeners) listener(); }
  private draw() { for (const renderer of this.renderers) renderer(); }
  private cancel() {
    this.epoch++;
    if (this.frame !== null) this.scheduler.cancel(this.frame);
    this.frame = null; this.last = null; this.debt = 0;
  }
  private advance() {
    try {
      this.state = step(this.state);
      if (this.state.tick === MAX_TICKS) this.status = 'completed';
    } catch (cause) { this.status = 'error'; this.error = cause instanceof Error ? cause.message : 'Engine failed.'; }
  }
  private schedule() {
    const epoch = this.epoch;
    this.frame = this.scheduler.request((time) => {
      if (this.disposed || epoch !== this.epoch || this.status !== 'running') return;
      this.frame = null;
      const interval = 1000 / this.rate;
      this.debt = Math.min(this.debt + Math.max(0, time - (this.last ?? time)), interval * 4);
      this.last = time;
      const started = this.scheduler.now();
      let count = 0;
      while (this.status === 'running' && this.debt + 1e-8 >= interval && count < 4) {
        this.advance(); this.debt -= interval; count++;
        if (this.scheduler.now() - started >= 8) break;
      }
      if (count) this.draw();
      if ((this.state.definition.version === 2 ? count > 0 && time - this.published >= 80 : time - this.published >= 250) || this.status !== 'running') { this.published = time; this.publish(); }
      if (this.status === 'running') this.schedule();
      else this.cancel();
    });
  }
  start() {
    if (this.disposed || this.status !== 'paused') return;
    this.status = 'running'; this.cancel(); this.publish(); this.schedule();
  }
  pause() {
    if (this.disposed) return;
    if (this.status === 'running') this.status = 'paused';
    this.cancel(); this.draw(); this.publish();
  }
  singleStep() {
    if (this.disposed || this.status !== 'paused') return;
    this.advance(); this.draw(); this.publish();
  }
  setRate(rate: Rate) {
    if (![1, 10, 30].includes(rate)) throw new Error('Unsupported display rate.');
    if (this.disposed) return;
    this.rate = rate; this.cancel(); this.publish();
    if (this.status === 'running') this.schedule();
  }
  reset() {
    if (this.disposed) return;
    this.cancel(); this.state = initialize(this.state.definition); this.status = 'paused'; this.error = '';
    this.draw(); this.publish();
  }
  /** Pauses on detach; a synchronous StrictMode reattach prevents disposal. */
  attach() {
    this.owners++;
    return () => {
      this.owners--; this.pause();
      queueMicrotask(() => { if (this.owners === 0) this.dispose(); });
    };
  }
  dispose() { this.cancel(); this.disposed = true; this.listeners.clear(); this.renderers.clear(); }
}
