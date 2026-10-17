/** test-field-reference@1: dimension-aware mechanics; old v4 module stays unchanged. */
import { parts, fits, canTurn, forwardCost } from '../ecology/body-genome.ts';
import { STEP } from '../ecology/oriented-geometry.ts';
import type { Creature } from '../ecology/genome-model.ts';
export function sense(c: Creature, food: Uint16Array, W: number, H: number): number[] {
  const mouth = parts(c).find((p) => p.role === "mouth")!,
    front = STEP[c.direction]!,
    right = STEP[(c.direction + 1) % 4]!;
  const radius =
      Math.min(12, c.genes.sense + 2 * parts(c).filter(p => p.role === "sensor").length),
    signals = [0, 0, 0, 0];
  for (let dy = -radius; dy <= radius; dy++)
    for (let dx = -radius; dx <= radius; dx++) {
      const distance = Math.abs(dx) + Math.abs(dy),
        x = mouth.x + dx,
        y = mouth.y + dy;
      const f = dx * front.x + dy * front.y,
        r = dx * right.x + dy * right.y;
      if (
        !distance ||
        distance > radius ||
        f < 0 ||
        x < 0 ||
        x >= W ||
        y < 0 ||
        y >= H
      )
        continue;
      const amount = Math.floor(food[y * W + x]! / distance);
      if (f > 0) signals[0]! += amount;
      if (r > 0) signals[1]! += amount;
      if (r < 0) signals[3]! += amount;
    }
  return signals;
}
export function act(
  c: Creature,
  desired: number,
  occupied: ReadonlySet<number>, W: number, H: number,
): number {
  c.desiredDirection = desired;
  if (!parts(c).some((p) => p.role === "motor")) {
    c.action = "Juvenile — growing a motor";
    return 0;
  }
  const delta = (desired - c.direction + 4) % 4;
  const turn = (direction: number) => {
    if (c.energy < 1 || !canTurn(c, direction, occupied, W, H)) return false;
    c.direction = direction;
    c.energy--;
    c.turns++;
    c.action = "Turning";
    return true;
  };
  if (delta) {
    const preferred = (c.direction + (delta === 3 ? 3 : 1)) % 4;
    if (turn(preferred) || turn((c.direction + (delta === 3 ? 1 : 3)) % 4))
      return 1;
    c.action = "Turn blocked by a body or wall";
    return 0;
  }
  const movementCost = forwardCost(c),
    d = STEP[c.direction]!;
  if (
    c.energy >= movementCost &&
    fits({ ...c, x: c.x + d.x, y: c.y + d.y }, occupied, W, H)
  ) {
    c.x += d.x;
    c.y += d.y;
    c.energy -= movementCost;
    c.distance++;
    c.action = "Moving forward";
    return movementCost;
  }
  if (turn((c.direction + 1) % 4) || turn((c.direction + 3) % 4)) return 1;
  c.action = "Forward path and turns blocked";
  return 0;
}

/** Same ADR0010 reward equation, with v4's larger physical input bounds. */
export function resourceReward(intake: number, mechanicalCost: number, upkeep: number): number {
  for(const [value,max] of [[intake,96],[mechanicalCost,5],[upkeep,18]] as const)
    if(!Number.isSafeInteger(value)||value<0||value>max)throw Error('Invalid test-field measured resource cost.');
  return Math.max(-32,Math.min(32,intake-mechanicalCost-upkeep));
}
