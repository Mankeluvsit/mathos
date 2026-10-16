import { useEffect, useRef } from 'react';
import { drawPixelPreview } from '../rendering/pixel-preview';

export function PixelPreview({ width, height }: { width: number; height: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawPixelPreview(ref.current, width, height);
  }, [width, height]);
  return (
    <figure className="preview">
      <div className="canvas-frame">
        <canvas ref={ref} role="img" aria-label={`Static ${width} by ${height} pixel checkerboard. Configuration preview only.`}>
          Static pixel checkerboard; configuration only.
        </canvas>
      </div>
      <figcaption>Static pixel preview — configuration only. {width} × {height} pixels.</figcaption>
    </figure>
  );
}
