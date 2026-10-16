export type BodyPlan = "dart" | "grazer" | "scout";
export type Role = "body" | "mouth" | "motor" | "sensor";
export interface Pose {
  x: number;
  y: number;
  direction: number;
  size: number;
  genes: { bodyPlan: BodyPlan };
}
export const DIRECTIONS = ["north", "east", "south", "west"] as const;
export const PLANS: readonly BodyPlan[] = ["dart", "grazer", "scout"];
export const STEP = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
] as const;
export function rotate(
  x: number,
  y: number,
  heading: number,
): { x: number; y: number } {
  switch (heading) {
    case 0:
      return { x, y };
    case 1:
      return { x: -y || 0, y: x };
    case 2:
      return { x: -x || 0, y: -y || 0 };
    case 3:
      return { x: y, y: -x || 0 };
    default:
      throw Error("Invalid heading.");
  }
}
export function planSize(plan: BodyPlan) {
  return plan === "dart" ? 3 : 4;
}
export function parts(c: Pose): Array<{ x: number; y: number; role: Role }> {
  const local: Array<{ x: number; y: number; role: Role }> = [
    { x: 0, y: 0, role: "body" },
    { x: 0, y: -1, role: "mouth" },
    { x: 0, y: 1, role: "motor" },
  ];
  if (c.genes.bodyPlan !== "dart")
    local.push({
      x: 1,
      y: 0,
      role: c.genes.bodyPlan === "grazer" ? "mouth" : "sensor",
    });
  return local
    .slice(0, c.size)
    .map((p) => ({ ...rotate(p.x, p.y, c.direction), role: p.role }))
    .map((p) => ({ ...p, x: c.x + p.x, y: c.y + p.y }));
}
export function fits(
  c: Pose,
  occupied: ReadonlySet<number>,
  width = 64,
  height = 48,
): boolean {
  return parts(c).every(
    (p) =>
      p.x >= 0 &&
      p.x < width &&
      p.y >= 0 &&
      p.y < height &&
      !occupied.has(p.y * width + p.x),
  );
}
/** A conservative integer sweep: each cell's old/new bounding rectangle. */
export function canTurn(
  c: Pose,
  direction: number,
  occupied: ReadonlySet<number>,
  width = 64,
  height = 48,
): boolean {
  if (![1, 3].includes((direction - c.direction + 4) % 4)) return false;
  const old = parts(c),
    next = parts({ ...c, direction });
  return old.every((a, i) => {
    const b = next[i]!;
    for (let y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++)
      for (let x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++)
        if (
          x < 0 ||
          x >= width ||
          y < 0 ||
          y >= height ||
          occupied.has(y * width + x)
        )
          return false;
    return true;
  });
}
