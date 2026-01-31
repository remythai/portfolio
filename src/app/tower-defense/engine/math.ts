export type Vec2 = { x: number; y: number };

export function clamp01(value: number) {
    if (value < 0)
        return 0;
    else if (value > 1)
        return 1;
    else
        return value;
}

export function distance(a: Vec2, b: Vec2) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

export function moveTowards(current: Vec2, target: Vec2, maxDelta: number): Vec2 {
    const d = distance(current, target);

    if (d === 0)
        return current;
    else if (maxDelta >= d)
        return { x: target.x, y: target.y };

    const t = maxDelta / d;

    return {
        x: current.x + (target.x - current.x) * t,
        y: current.y + (target.y - current.y) * t
    };
}
