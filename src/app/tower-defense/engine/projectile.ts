import type { Vec2 } from "./math";
import { distance, moveTowards } from "./math";

export type ProjectileType = "shuriken" | "bullet" | "blowdart" | "smokebomb";

export type ProjectileSpriteDef = {
    src: string;
    size: number;
};

export type ProjectileInstance = {
    id: number;
    type: ProjectileType;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    targetEnemyId: number;
    damage: number;
    speed: number;
    sprite: ProjectileSpriteDef;
    rotation: number;
};

export type ProjectileUpdateResult = {
    projectiles: ProjectileInstance[];
    hitEvents: Array<{ enemyId: number; dmg: number }>;
};

const PROJECTILE_SPRITES: Record<ProjectileType, ProjectileSpriteDef> = {
    shuriken: { src: "/textures/shuriken.png", size: 16 },
    bullet: { src: "/textures/bullet.png", size: 12 },
    blowdart: { src: "/textures/blowdart.png", size: 14 },
    smokebomb: { src: "/textures/smokebomb.png", size: 18 }
};

const PROJECTILE_SPEED = 400;
const HIT_DETECTION_DISTANCE = 10;

export function getTowerProjectileType(towerTypeId: string): ProjectileType {
    if (towerTypeId.includes("gun"))
        return "bullet";
    
    if (towerTypeId.includes("poison"))
        return "blowdart";
    
    if (towerTypeId.includes("smoke"))
        return "smokebomb";
    
    return "shuriken";
}

export function spawnProjectile(params: {
    projectiles: ProjectileInstance[];
    nextId: number;
    type: ProjectileType;
    start: Vec2;
    target: Vec2;
    targetEnemyId: number;
    damage: number;
}): { projectiles: ProjectileInstance[]; nextId: number } {
    const { 
        projectiles, 
        nextId, 
        type, 
        start, 
        target, 
        targetEnemyId, 
        damage 
    } = params;

    const deltaX = target.x - start.x;
    const deltaY = target.y - start.y;
    const rotation = Math.atan2(deltaY, deltaX);

    const newProjectile: ProjectileInstance = {
        id: nextId,
        type,
        x: start.x,
        y: start.y,
        targetX: target.x,
        targetY: target.y,
        targetEnemyId,
        damage,
        speed: PROJECTILE_SPEED,
        sprite: PROJECTILE_SPRITES[type],
        rotation
    };

    return {
        projectiles: [...projectiles, newProjectile],
        nextId: nextId + 1
    };
}

export function updateProjectiles(params: {
    projectiles: ProjectileInstance[];
    enemies: Array<{ id: number; x: number; y: number }>;
    dt: number;
}): ProjectileUpdateResult {
    const { projectiles, enemies, dt } = params;

    const survivingProjectiles: ProjectileInstance[] = [];
    const hitEvents: Array<{ enemyId: number; dmg: number }> = [];

    for (const projectile of projectiles) {
        const targetEnemy = enemies.find(
            enemy => enemy.id === projectile.targetEnemyId
        );

        const targetPosition: Vec2 = targetEnemy 
            ? { x: targetEnemy.x, y: targetEnemy.y }
            : { x: projectile.targetX, y: projectile.targetY };

        const currentPosition = { 
            x: projectile.x, 
            y: projectile.y 
        };
        
        const distanceToTarget = distance(currentPosition, targetPosition);

        if (distanceToTarget < HIT_DETECTION_DISTANCE) {
            if (targetEnemy) {
                hitEvents.push({
                    enemyId: projectile.targetEnemyId,
                    dmg: projectile.damage
                });
            }
            continue;
        }

        const nextPosition = moveTowards(
            currentPosition, 
            targetPosition, 
            projectile.speed * dt
        );

        const deltaX = targetPosition.x - nextPosition.x;
        const deltaY = targetPosition.y - nextPosition.y;
        const rotation = Math.atan2(deltaY, deltaX);

        const updatedProjectile = {
            ...projectile,
            x: nextPosition.x,
            y: nextPosition.y,
            targetX: targetPosition.x,
            targetY: targetPosition.y,
            rotation
        };

        survivingProjectiles.push(updatedProjectile);
    }

    return {
        projectiles: survivingProjectiles,
        hitEvents
    };
}