import type { Vec2 } from "./math";
import { moveTowards } from "./math";

export type SpriteDef = {
  src: string;
  frameSize: number;
  cols: number;
  rows: number;
  fps: number;
};

export type EnemyType = {
  id: string;
  hp: number;
  speed: number;
  color: string;
  radiusScale: number;
  sprite?: SpriteDef;
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
  animTime: number;
  dirRow: 0 | 1 | 2 | 3;
  sprite?: SpriteDef;
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
    radius: Math.max(6, tileSize * Math.max(0.1, type.radiusScale)),
    color: type.color,
    animTime: 0,
    dirRow: 2,
    sprite: type.sprite
  };

  return { enemies: [...enemies, e], nextId: nextId + 1 };
}

function dirRowFromVector(dx: number, dy: number): 0 | 1 | 2 | 3 {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);

  if (ax >= ay) return dx >= 0 ? 1 : 3;
  return dy >= 0 ? 2 : 0;
}

export function updateEnemies(params: { enemies: EnemyInstance[]; dt: number; waypoints: Vec2[] }): EnemyInstance[] {
  const { enemies, dt, waypoints } = params;
  if (waypoints.length < 2) return enemies;

  const updated: EnemyInstance[] = [];

  for (const e of enemies) {
    let wpIndex = e.waypointIndex;
    if (wpIndex < 0) wpIndex = 0;
    if (wpIndex >= waypoints.length) wpIndex = 0;

    const target = waypoints[wpIndex];

    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const dirRow = dirRowFromVector(dx, dy);

    const nextPos = moveTowards({ x: e.x, y: e.y }, target, e.speed * dt);

    let nextIndex = wpIndex;
    if (nextPos.x === target.x && nextPos.y === target.y) {
      nextIndex += 1;
      if (nextIndex >= waypoints.length) continue;
    }

    updated.push({
      ...e,
      x: nextPos.x,
      y: nextPos.y,
      waypointIndex: nextIndex,
      dirRow,
      animTime: e.animTime + dt
    });
  }

  return updated;
}
