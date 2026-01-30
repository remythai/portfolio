import type { Vec2 } from "./math";
import { moveTowards } from "./math";

export type EnemyType = {
  id: string;
  hp: number;
  speed: number;
  color: string;
  radiusScale: number;
};

export type EnemyInstance = {
  id: number;
  typeId: string;
  x: number;
  y: number;
  speed: number;
  hp: number;
  maxHp: number;
  waypointIndex: number;
  radius: number;
  color: string;
};

export function spawnEnemy(params: {
  enemies: EnemyInstance[];
  nextId: number;
  type: EnemyType;
  start: Vec2;
  tileSize: number;
}): { enemies: EnemyInstance[]; nextId: number } {
  const { enemies, nextId, type, start, tileSize } = params;

  const hp = Math.max(1, type.hp);

  const e: EnemyInstance = {
    id: nextId,
    typeId: type.id,
    x: start.x,
    y: start.y,
    speed: Math.max(10, type.speed),
    hp,
    maxHp: hp,
    waypointIndex: 1,
    radius: Math.max(5, tileSize * Math.max(0.05, type.radiusScale)),
    color: type.color
  };

  return { enemies: [...enemies, e], nextId: nextId + 1 };
}

export function updateEnemies(params: {
  enemies: EnemyInstance[];
  dt: number;
  waypoints: Vec2[];
}): EnemyInstance[] {
  const { enemies, dt, waypoints } = params;
  if (waypoints.length < 2) return enemies;

  const updated: EnemyInstance[] = [];

  for (const e of enemies) {
    let wpIndex = e.waypointIndex;
    if (wpIndex < 0) wpIndex = 0;
    if (wpIndex >= waypoints.length) wpIndex = 0;

    const target = waypoints[wpIndex];
    const nextPos = moveTowards({ x: e.x, y: e.y }, target, e.speed * dt);

    let nextIndex = wpIndex;
    if (nextPos.x === target.x && nextPos.y === target.y) {
      nextIndex += 1;
      if (nextIndex >= waypoints.length) {
        continue; // fin du chemin -> remove
      }
    }

    updated.push({ ...e, x: nextPos.x, y: nextPos.y, waypointIndex: nextIndex });
  }

  return updated;
}
