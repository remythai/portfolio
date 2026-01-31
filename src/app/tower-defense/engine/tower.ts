import type { Vec2 } from "./math";

export type TowerSpriteDef = {
  src: string;
  frameSize: number;
  cols: number;
  rows: number;
  fps: number;
};

export type TowerType = {
  id: string;
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  sprite: TowerSpriteDef;
};

export type TowerInstance = {
  id: number;
  typeId: string;

  gridX: number;
  gridY: number;

  x: number;
  y: number;

  rangePx: number;
  damage: number;
  fireRate: number;
  cooldownSec: number;

  animTime: number;
  dirRow: 0 | 1 | 2 | 3 | 4 | 5; // 0 down, 1 down-right, 2 down-left, 3 up, 4 up-right, 5 up-left
  sprite: TowerSpriteDef;
};

export type EnemyTarget = {
  id: number;
  x: number;
  y: number;
};

function distanceSquared(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  return dx * dx + dy * dy;
}

export function towerDirRowFromVector(dx: number, dy: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (dy >= 0) {
    if (Math.abs(dx) < Math.abs(dy) * 0.4)
      return 0;
    else if (dx >= 0)
      return 1;
    else
      return 2;
  }
  else if (Math.abs(dx) < Math.abs(dy) * 0.4)
    return 3;
  else if (dx >= 0)
    return 4;
  else
    return 5;
}

export function placeTower(params: {
  towers: TowerInstance[];
  nextId: number;
  type: TowerType;
  gridX: number;
  gridY: number;
  center: Vec2;
  tileSize: number;
}): { towers: TowerInstance[]; nextId: number } {
  const { towers, nextId, type, gridX, gridY, center, tileSize } = params;

  const tower: TowerInstance = {
    id: nextId,
    typeId: type.id,
    gridX,
    gridY,
    x: center.x,
    y: center.y,
    rangePx: type.range * tileSize,
    damage: type.damage,
    fireRate: type.fireRate,
    cooldownSec: 0,
    animTime: 0,
    dirRow: 0,
    sprite: type.sprite
  };

  return { towers: [...towers, tower], nextId: nextId + 1 };
}

export function updateTowers(params: {
  towers: TowerInstance[];
  enemies: EnemyTarget[];
  dt: number;
}): { towers: TowerInstance[]; damageEvents: Array<{ enemyId: number; dmg: number }> } {
  const { towers, enemies, dt } = params;

  const damageEvents: Array<{ enemyId: number; dmg: number }> = [];
  const nextTowers: TowerInstance[] = [];

  for (const tower of towers) {
    const rangeSquared = tower.rangePx * tower.rangePx;

    let bestTarget: EnemyTarget | null = null;
    let bestDist2 = Infinity;

    for (const enemy of enemies) {
      const d2 = distanceSquared(tower.x, tower.y, enemy.x, enemy.y);

      if (d2 > rangeSquared)
        continue;

      else if (d2 < bestDist2) {
        bestDist2 = d2;
        bestTarget = enemy;
      }
    }

    let nextDirRow = tower.dirRow;
    let nextCooldown = Math.max(0, tower.cooldownSec - dt);

    if (bestTarget !== null) {
      const dx = bestTarget.x - tower.x;
      const dy = bestTarget.y - tower.y;
      nextDirRow = towerDirRowFromVector(dx, dy);

      if (nextCooldown <= 0) {
        damageEvents.push({ enemyId: bestTarget.id, dmg: tower.damage });
        nextCooldown = 1 / Math.max(0.1, tower.fireRate);
      }
    }

    nextTowers.push({
      ...tower,
      dirRow: nextDirRow,
      cooldownSec: nextCooldown,
      animTime: tower.animTime + dt
    });
  }

  return { towers: nextTowers, damageEvents };
}
