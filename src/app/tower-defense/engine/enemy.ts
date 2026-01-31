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
    dirRow: 0 | 1 | 2 | 3; // 0 up, 1 right, 2 down, 3 left
    sprite?: SpriteDef;
};

function directionRowFromVector(dx: number, dy: number): 0 | 1 | 2 | 3 {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX >= absY) {
        if (dx >= 0)
            return 1;
        else
            return 3;
    }
    else if (dy >= 0)
        return 2;
    else
        return 0;
}

export function spawnEnemy(params: {
    enemies: EnemyInstance[];
    nextId: number;
    type: EnemyType;
    start: Vec2;
    tileSize: number;
}): { enemies: EnemyInstance[]; nextId: number } {
    const { enemies, nextId, type, start, tileSize } = params;

    const maxHp = Math.max(1, type.hp);
    const radius = Math.max(6, tileSize * Math.max(0.1, type.radiusScale));

    const enemy: EnemyInstance = {
        id: nextId,
        typeId: type.id,
        x: start.x,
        y: start.y,
        speed: Math.max(10, type.speed),
        hp: maxHp,
        maxHp,
        waypointIndex: 1,
        radius,
        color: type.color,
        animTime: 0,
        dirRow: 2,
        sprite: type.sprite
    };

    return { enemies: [...enemies, enemy], nextId: nextId + 1 };
}

export function updateEnemies(params: { enemies: EnemyInstance[]; dt: number; waypoints: Vec2[] }): EnemyInstance[] {
    const { enemies, dt, waypoints } = params;

    if (waypoints.length < 2)
        return enemies;

    const nextEnemies: EnemyInstance[] = [];

    for (const enemy of enemies) {
        let waypointIndex = enemy.waypointIndex;

        if (waypointIndex < 0 || waypointIndex >= waypoints.length)
            waypointIndex = 0;

        const target = waypoints[waypointIndex];
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;

        const dirRow = directionRowFromVector(dx, dy);
        const nextPos = moveTowards({ x: enemy.x, y: enemy.y }, target, enemy.speed * dt);

        let nextWaypointIndex = waypointIndex;

        if (nextPos.x === target.x && nextPos.y === target.y) {
            nextWaypointIndex += 1;

            if (nextWaypointIndex >= waypoints.length)
                continue;
        }

        nextEnemies.push({
            ...enemy,
            x: nextPos.x,
            y: nextPos.y,
            waypointIndex: nextWaypointIndex,
            dirRow,
            animTime: enemy.animTime + dt
        });
    }

    return nextEnemies;
}

export function applyEnemyDamage(enemies: EnemyInstance[], events: Array<{ enemyId: number; dmg: number }>) {
    if (events.length === 0)
        return enemies;

    const damageByEnemyId = new Map<number, number>();

    for (const event of events)
        damageByEnemyId.set(event.enemyId, (damageByEnemyId.get(event.enemyId) ?? 0) + event.dmg);

    const nextEnemies: EnemyInstance[] = [];

    for (const enemy of enemies) {
        const dmg = damageByEnemyId.get(enemy.id) ?? 0;
        const hp = enemy.hp - dmg;

        if (hp > 0)
            nextEnemies.push({ ...enemy, hp });
    }

    return nextEnemies;
}
