import { cellParts, W, H, type Ecology } from "../ecology/world";
export const ECOLOGY_CELL = 12;
export function drawEcology(
  ctx: CanvasRenderingContext2D,
  world: Ecology,
  selected: number,
) {
  const z = ECOLOGY_CELL;
  ctx.fillStyle = "#060d16";
  ctx.fillRect(0, 0, W * z, H * z);
  for (let p = 0; p < world.food.length; p++)
    if (world.food[p]) {
      ctx.fillStyle = "#64d88a";
      ctx.beginPath();
      ctx.arc(
        ((p % W) + 0.5) * z,
        (Math.floor(p / W) + 0.5) * z,
        2.1,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  const colors = {
    body: "#63c6ff",
    mouth: "#f4b75f",
    motor: "#cf88e9",
    sensor: "#7ce0d0",
  };
  for (const c of world.creatures) {
    const parts = cellParts(c),
      occupied = new Set(parts.map((p) => `${p.x},${p.y}`));
    ctx.strokeStyle = c.id === selected ? "#ffffff" : "#678095";
    ctx.lineWidth = c.id === selected ? 2 : 1;
    for (const p of parts) {
      const x = p.x * z,
        y = p.y * z;
      ctx.fillStyle = colors[p.role];
      ctx.fillRect(x + 2, y + 2, z - 4, z - 4);
      ctx.beginPath();
      if (!occupied.has(`${p.x},${p.y - 1}`)) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + z, y);
      }
      if (!occupied.has(`${p.x + 1},${p.y}`)) {
        ctx.moveTo(x + z, y);
        ctx.lineTo(x + z, y + z);
      }
      if (!occupied.has(`${p.x},${p.y + 1}`)) {
        ctx.moveTo(x + z, y + z);
        ctx.lineTo(x, y + z);
      }
      if (!occupied.has(`${p.x - 1},${p.y}`)) {
        ctx.moveTo(x, y + z);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // The nose triangle is attached to the front mouth and points with heading.
    const nose = parts.find((p) => p.role === "mouth")!;
    ctx.save();
    ctx.translate((nose.x + 0.5) * z, (nose.y + 0.5) * z);
    ctx.rotate((c.direction * Math.PI) / 2);
    ctx.fillStyle = "#152132";
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(3, 2);
    ctx.lineTo(-3, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    if (c.id === selected) {
      const minY = Math.min(...parts.map((p) => p.y)),
        minX = Math.min(...parts.map((p) => p.x));
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px system-ui";
      ctx.fillText(
        `#${c.id}`,
        Math.max(1, minX * z),
        Math.max(11, minY * z - 5),
      );
    }
  }
}
