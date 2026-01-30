export type Vec2 = { x: number; y: number };

export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function dist(a: Vec2, b: Vec2) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function moveTowards(current: Vec2, target: Vec2, maxDelta: number): Vec2 {
  const d = dist(current, target);
  if (d === 0 || maxDelta >= d) return { x: target.x, y: target.y };
  const t = maxDelta / d;
  return { x: current.x + (target.x - current.x) * t, y: current.y + (target.y - current.y) * t };
}
