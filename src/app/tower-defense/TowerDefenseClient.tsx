"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FastForward, Pause, Play, Save, Settings } from "lucide-react";

import type { EnemiesJson, MapJson, TowersJson, WaveSetJson } from "./page";

import { clamp01, type Vec2 } from "./engine/math";
import type { EnemyInstance, EnemyType, EnemyUpdateResult } from "./engine/enemy";
import { applyEnemyDamage, spawnEnemy, updateEnemies } from "./engine/enemy";
import type { TowerInstance, TowerType } from "./engine/tower";
import { placeTower, updateTowers } from "./engine/tower";

type SpeedMode = "pause" | "play" | "fast";

type World = {
    canvasWidth: number;
    canvasHeight: number;
    tileSize: number;
    gridOffsetX: number;
    gridOffsetY: number;
    waypoints: Vec2[];
};

type SpriteDrawParams = {
    spriteSrc: string;
    frameSize: number;
    cols: number;
    fps: number;
    animTime: number;
    row: number;
    x: number;
    y: number;
    drawSize: number;
};

export default function TowerDefenseClient(props: {
    map: MapJson;
    enemies: EnemiesJson;
    waveSet: WaveSetJson;
    towers: TowersJson;
}) {
    const { map, enemies, waveSet, towers } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const animationFrameIdRef = useRef<number | null>(null);
    const lastTimestampRef = useRef<number>(0);

    const enemyListRef = useRef<EnemyInstance[]>([]);
    const nextEnemyIdRef = useRef(1);

    const towerListRef = useRef<TowerInstance[]>([]);
    const nextTowerIdRef = useRef(1);

    const waveIndexRef = useRef(0);
    const spawnedCountInWaveRef = useRef(0);
    const spawnTimerRef = useRef(0);

    const livesRef = useRef(20);

    const [speedMode, setSpeedMode] = useState<SpeedMode>("pause");
    const [selectedTowerTypeId, setSelectedTowerTypeId] = useState("ninja_basic");
    const [money, setMoney] = useState(420);
    const [lives, setLives] = useState(20);
    const [waveIndexUi, setWaveIndexUi] = useState(0);

    const grid = map.grid;
    const rowCount = grid.length;
    const colCount = grid[0]?.length ?? 0;

    const groundTilesetRef = useRef<HTMLImageElement | null>(null);
    const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

    const renderFnRef = useRef<(() => void) | null>(null);
    const requestRender = useCallback(() => {
        const renderNow = renderFnRef.current;
        if (renderNow === null) return;
        renderNow();
    }, []);

    const speedMultiplier = speedMode === "fast" ? 2 : speedMode === "play" ? 1 : 0;
    const isRunning = speedMultiplier > 0;

    const enemyTypesById = useMemo(() => {
        const byId = new Map<string, EnemyType>();
        for (const enemyType of enemies.types)
            byId.set(enemyType.id, enemyType as EnemyType);
        return byId;
    }, [enemies.types]);

    const towerTypesById = useMemo(() => {
        const byId = new Map<string, TowerType>();
        for (const towerType of towers.types)
            byId.set(towerType.id, towerType as unknown as TowerType);
        return byId;
    }, [towers.types]);

    function getContext2D() {
        const canvas = canvasRef.current;
        if (canvas === null) return null;
        return canvas.getContext("2d");
    }

    const computeWorld = useCallback((): World | null => {
        const container = containerRef.current;
        if (container === null || rowCount === 0 || colCount === 0) return null;

        const canvasWidth = container.clientWidth;
        const canvasHeight = container.clientHeight;

        const tileSize = Math.min(canvasWidth / colCount, canvasHeight / rowCount);

        const gridWidth = colCount * tileSize;
        const gridHeight = rowCount * tileSize;

        const gridOffsetX = (canvasWidth - gridWidth) / 2;
        const gridOffsetY = (canvasHeight - gridHeight) / 2;

        const waypoints: Vec2[] = map.path.waypoints.map((p) => ({
            x: gridOffsetX + (p.x + 0.5) * tileSize,
            y: gridOffsetY + (p.y + 0.5) * tileSize
        }));

        return {
            canvasWidth,
            canvasHeight,
            tileSize,
            gridOffsetX,
            gridOffsetY,
            waypoints
        };
    }, [colCount, rowCount, map.path.waypoints]);

    const resizeCanvasToContainer = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (canvas === null || container === null) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        if (ctx === null) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
    }, []);

    useEffect(() => {
        const img = new Image();
        img.src = "/textures/tileset_grass.png";
        groundTilesetRef.current = img;

        img.addEventListener("load", requestRender);
        return () => {
            img.removeEventListener("load", requestRender);
        };
    }, [requestRender]);

    useEffect(() => {
        const enemyUrls = enemies.types.map((t) => t.sprite?.src).filter(Boolean) as string[];
        const towerUrls = towers.types.map((t) => t.sprite?.src).filter(Boolean) as string[];

        const uniqueUrls = Array.from(new Set([...enemyUrls, ...towerUrls]));
        const createdImages: HTMLImageElement[] = [];

        for (const url of uniqueUrls) {
            if (imageCacheRef.current.has(url)) continue;

            const img = new Image();
            img.src = url;

            imageCacheRef.current.set(url, img);
            createdImages.push(img);

            img.addEventListener("load", requestRender);
        }

        return () => {
            for (const img of createdImages)
                img.removeEventListener("load", requestRender);
        };
    }, [enemies.types, towers.types, requestRender]);

    const spawnEnemyFromCurrentWave = useCallback(() => {
        const world = computeWorld();
        if (world === null || world.waypoints.length < 2) return;

        const wave = waveSet.waves[waveIndexRef.current];
        if (!wave || spawnedCountInWaveRef.current >= wave.count) return;

        const enemyType = enemyTypesById.get(wave.enemyId);
        if (!enemyType) return;

        const spawnResult = spawnEnemy({
            enemies: enemyListRef.current,
            nextId: nextEnemyIdRef.current,
            type: enemyType,
            start: world.waypoints[0],
            tileSize: world.tileSize
        });

        enemyListRef.current = spawnResult.enemies;
        nextEnemyIdRef.current = spawnResult.nextId;
        spawnedCountInWaveRef.current += 1;
    }, [computeWorld, enemyTypesById, waveSet.waves]);

    function getCanvasMousePosition(evt: MouseEvent): Vec2 | null {
        const canvas = canvasRef.current;
        if (canvas === null) return null;

        const rect = canvas.getBoundingClientRect();

        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function getGridCellFromCanvasPosition(world: World, pos: Vec2) {
        return {
            gridX: Math.floor((pos.x - world.gridOffsetX) / world.tileSize),
            gridY: Math.floor((pos.y - world.gridOffsetY) / world.tileSize)
        };
    }

    const placeSelectedTowerAt = useCallback(
        (gridX: number, gridY: number) => {
            const world = computeWorld();
            if (world === null) return;

            const insideGrid = gridX >= 0 && gridY >= 0 && gridX < colCount && gridY < rowCount;
            if (!insideGrid) return;

            const cell = grid[gridY][gridX];
            if (cell === map.gridLegend.wall || cell === map.gridLegend.path) return;

            const alreadyOccupied = towerListRef.current.some((t) => t.gridX === gridX && t.gridY === gridY);
            if (alreadyOccupied) return;

            const towerType = towerTypesById.get(selectedTowerTypeId);
            if (!towerType || money < towerType.cost) return;

            const center: Vec2 = {
                x: world.gridOffsetX + (gridX + 0.5) * world.tileSize,
                y: world.gridOffsetY + (gridY + 0.5) * world.tileSize
            };

            const placed = placeTower({
                towers: towerListRef.current,
                nextId: nextTowerIdRef.current,
                type: towerType,
                gridX,
                gridY,
                center,
                tileSize: world.tileSize
            });

            towerListRef.current = placed.towers;
            nextTowerIdRef.current = placed.nextId;

            setMoney((prev) => prev - towerType.cost);
            requestRender();
        },
        [
            colCount,
            rowCount,
            computeWorld,
            grid,
            map.gridLegend.path,
            map.gridLegend.wall,
            money,
            requestRender,
            selectedTowerTypeId,
            towerTypesById
        ]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return;

        const handleClick = (evt: MouseEvent) => {
            const world = computeWorld();
            if (world === null) return;

            const pos = getCanvasMousePosition(evt);
            if (pos === null) return;

            const isGameOver = livesRef.current === 0;
            const currentWaveIndex = waveIndexRef.current;
            const totalWaves = waveSet.waves.length;
            const isVictory = currentWaveIndex >= totalWaves;

            if (isGameOver || isVictory) {
                const btnY = world.canvasHeight / 2 + 150;

                const replayBtnX = world.canvasWidth / 2 - 260;
                if (pos.x >= replayBtnX && pos.x <= replayBtnX + 240 &&
                    pos.y >= btnY && pos.y <= btnY + 60) {
                    window.location.reload();
                    return;
                }

                const portfolioBtnX = world.canvasWidth / 2 + 20;
                if (pos.x >= portfolioBtnX && pos.x <= portfolioBtnX + 240 &&
                    pos.y >= btnY && pos.y <= btnY + 60) {
                    window.location.href = "/";
                    return;
                }
            }

            const cell = getGridCellFromCanvasPosition(world, pos);
            placeSelectedTowerAt(cell.gridX, cell.gridY);
        };

        canvas.addEventListener("click", handleClick);
        return () => {
            canvas.removeEventListener("click", handleClick);
        };
    }, [computeWorld, placeSelectedTowerAt, waveSet.waves.length]);

    const updateGame = useCallback(
        (dt: number) => {
            if (speedMultiplier <= 0) return;

            const scaledDt = dt * speedMultiplier;
            const wave = waveSet.waves[waveIndexRef.current];
            if (!wave) return;

            spawnTimerRef.current += scaledDt;

            while (spawnTimerRef.current >= wave.intervalSec) {
                spawnTimerRef.current -= wave.intervalSec;
                spawnEnemyFromCurrentWave();

                if (spawnedCountInWaveRef.current >= wave.count) break;
            }

            const world = computeWorld();
            if (world === null) return;

            const enemyUpdate = updateEnemies({
                enemies: enemyListRef.current,
                dt: scaledDt,
                waypoints: world.waypoints
            });

            const towerUpdate = updateTowers({
                towers: towerListRef.current,
                enemies: enemyUpdate.enemies.map((e) => ({ id: e.id, x: e.x, y: e.y })),
                dt: scaledDt
            });

            const enemiesAfterDamage = applyEnemyDamage(enemyUpdate.enemies, towerUpdate.damageEvents);

            let moneyEarned = 0;
            for (const event of towerUpdate.damageEvents) {
                const killedEnemy = enemiesAfterDamage.find(e => e.id === event.enemyId);
                if (killedEnemy) {
                    const type = enemyTypesById.get(killedEnemy.typeId);
                    moneyEarned += type?.reward ?? 1;
                }
            }
            if (moneyEarned > 0)
                setMoney(prev => prev + moneyEarned);

            if (enemyUpdate.escapedCount > 0) {
                livesRef.current = Math.max(0, livesRef.current - enemyUpdate.escapedCount);
                setLives(livesRef.current);
            }

            const doneSpawning = spawnedCountInWaveRef.current >= wave.count;
            const noEnemiesLeft = enemiesAfterDamage.length === 0;

            if (doneSpawning && noEnemiesLeft) {
                if (waveIndexRef.current < waveSet.waves.length) {
                    waveIndexRef.current += 1;
                    spawnedCountInWaveRef.current = 0;
                    spawnTimerRef.current = 0;
                    setWaveIndexUi(waveIndexRef.current);
                    
                    if (waveIndexRef.current < waveSet.waves.length)
                        setMoney(prev => prev + 20);
                }
            }

            enemyListRef.current = enemiesAfterDamage;
            towerListRef.current = towerUpdate.towers;
        },
        [computeWorld, spawnEnemyFromCurrentWave, speedMultiplier, waveSet.waves, enemyTypesById]
    );

    function drawSpriteFrame(ctx: CanvasRenderingContext2D, p: SpriteDrawParams) {
        const img = imageCacheRef.current.get(p.spriteSrc);
        if (!img || !img.complete) return;

        const col = Math.floor(p.animTime * p.fps) % p.cols;
        const sx = col * p.frameSize;
        const sy = p.row * p.frameSize;

        ctx.drawImage(
            img,
            sx, sy, p.frameSize, p.frameSize,
            p.x - p.drawSize / 2,
            p.y - p.drawSize / 2,
            p.drawSize, p.drawSize
        );
    }

    const renderFrame = useCallback(() => {
        const ctx = getContext2D();
        const world = computeWorld();

        if (ctx === null || world === null) {
            return;
        }

        if (livesRef.current === 0) {
            const gradient = ctx.createLinearGradient(0, 0, 0, world.canvasHeight);
            gradient.addColorStop(0, "rgba(139, 0, 0, 0.95)");
            gradient.addColorStop(1, "rgba(78, 0, 0, 0.95)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, world.canvasWidth, world.canvasHeight);

            ctx.strokeStyle = "#ff3333";
            ctx.lineWidth = 8;
            ctx.strokeRect(20, 20, world.canvasWidth - 40, world.canvasHeight - 40);

            ctx.fillStyle = "#ff6666";
            ctx.font = "bold 72px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
            ctx.shadowBlur = 20;
            ctx.fillText("GAME OVER", world.canvasWidth / 2, world.canvasHeight / 2 - 80);

            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ff9999";
            ctx.font = "bold 32px monospace";
            ctx.fillText("Toutes vos tours ont été dépassées", world.canvasWidth / 2, world.canvasHeight / 2 - 20);

            ctx.fillStyle = "#ffffff";
            ctx.font = "24px monospace";
            ctx.fillText(`Wave ${waveIndexUi + 1} terminée`, world.canvasWidth / 2, world.canvasHeight / 2 + 50);
            ctx.fillText(`Argent final: $${money}`, world.canvasWidth / 2, world.canvasHeight / 2 + 90);

            const btnY = world.canvasHeight / 2 + 150;

            ctx.fillStyle = "#ff4444";
            ctx.fillRect(world.canvasWidth / 2 - 260, btnY, 240, 60);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;
            ctx.strokeRect(world.canvasWidth / 2 - 260, btnY, 240, 60);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px monospace";
            ctx.textBaseline = "middle";
            ctx.fillText("REJOUER", world.canvasWidth / 2 - 140, btnY + 30);

            ctx.fillStyle = "#4a90e2";
            ctx.fillRect(world.canvasWidth / 2 + 20, btnY, 240, 60);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;
            ctx.strokeRect(world.canvasWidth / 2 + 20, btnY, 240, 60);

            ctx.fillStyle = "#ffffff";
            ctx.fillText("PORTFOLIO", world.canvasWidth / 2 + 140, btnY + 30);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            return;
        }

        const currentWaveIndex = waveIndexRef.current;
        const totalWaves = waveSet.waves.length;
        if (currentWaveIndex >= totalWaves && livesRef.current > 0) {
            const gradient = ctx.createLinearGradient(0, 0, 0, world.canvasHeight);
            gradient.addColorStop(0, "rgba(255, 215, 0, 0.95)");
            gradient.addColorStop(1, "rgba(184, 134, 11, 0.95)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, world.canvasWidth, world.canvasHeight);

            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 8;
            ctx.strokeRect(20, 20, world.canvasWidth - 40, world.canvasHeight - 40);

            ctx.fillStyle = "#ffeb3b";
            ctx.font = "bold 72px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
            ctx.shadowBlur = 20;
            ctx.fillText("VICTOIRE !", world.canvasWidth / 2, world.canvasHeight / 2 - 80);

            ctx.shadowBlur = 0;
            ctx.fillStyle = "#fff176";
            ctx.font = "bold 32px monospace";
            ctx.fillText("Toutes les vagues vaincues !", world.canvasWidth / 2, world.canvasHeight / 2 - 20);

            ctx.fillStyle = "#ffffff";
            ctx.font = "24px monospace";
            ctx.fillText(`Wave ${totalWaves} terminée`, world.canvasWidth / 2, world.canvasHeight / 2 + 50);
            ctx.fillText(`Score final: $${money}`, world.canvasWidth / 2, world.canvasHeight / 2 + 90);

            const btnY = world.canvasHeight / 2 + 150;

            ctx.fillStyle = "#4caf50";
            ctx.fillRect(world.canvasWidth / 2 - 260, btnY, 240, 60);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;
            ctx.strokeRect(world.canvasWidth / 2 - 260, btnY, 240, 60);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px monospace";
            ctx.textBaseline = "middle";
            ctx.fillText("REJOUER", world.canvasWidth / 2 - 140, btnY + 30);

            ctx.fillStyle = "#4a90e2";
            ctx.fillRect(world.canvasWidth / 2 + 20, btnY, 240, 60);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;
            ctx.strokeRect(world.canvasWidth / 2 + 20, btnY, 240, 60);

            ctx.fillStyle = "#ffffff";
            ctx.fillText("PORTFOLIO", world.canvasWidth / 2 + 140, btnY + 30);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            return;
        }

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, world.canvasWidth, world.canvasHeight);

        const tileset = groundTilesetRef.current;
        const srcTileSize = 32;
        const srcCol = 0;
        const srcRow = 7;
        const srcX = srcCol * srcTileSize;
        const srcY = srcRow * srcTileSize;

        if (tileset && tileset.complete) {
            for (let gy = 0; gy < rowCount; gy++) {
                for (let gx = 0; gx < colCount; gx++) {
                    const dx = world.gridOffsetX + gx * world.tileSize;
                    const dy = world.gridOffsetY + gy * world.tileSize;

                    ctx.drawImage(tileset, srcX, srcY, srcTileSize, srcTileSize, dx, dy, world.tileSize, world.tileSize);
                }
            }
        } else {
            ctx.fillStyle = "#064e3b";
            ctx.fillRect(world.gridOffsetX, world.gridOffsetY, colCount * world.tileSize, rowCount * world.tileSize);
        }

        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 1;

        for (let x = 0; x <= colCount; x++) {
            ctx.beginPath();
            ctx.moveTo(world.gridOffsetX + x * world.tileSize, world.gridOffsetY);
            ctx.lineTo(world.gridOffsetX + x * world.tileSize, world.gridOffsetY + rowCount * world.tileSize);
            ctx.stroke();
        }

        for (let y = 0; y <= rowCount; y++) {
            ctx.beginPath();
            ctx.moveTo(world.gridOffsetX, world.gridOffsetY + y * world.tileSize);
            ctx.lineTo(world.gridOffsetX + colCount * world.tileSize, world.gridOffsetY + y * world.tileSize);
            ctx.stroke();
        }

        for (const tower of towerListRef.current) {
            drawSpriteFrame(ctx, {
                spriteSrc: tower.sprite.src,
                frameSize: tower.sprite.frameSize,
                cols: tower.sprite.cols,
                fps: tower.sprite.fps,
                animTime: tower.animTime,
                row: tower.dirRow,
                x: tower.x,
                y: tower.y,
                drawSize: world.tileSize * 1.35
            });

            if (speedMode === "pause") {
                ctx.strokeStyle = "rgba(59,130,246,0.35)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(tower.x, tower.y, tower.rangePx, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }

        for (const enemy of enemyListRef.current) {
            if (enemy.sprite) {
                drawSpriteFrame(ctx, {
                    spriteSrc: enemy.sprite.src,
                    frameSize: enemy.sprite.frameSize,
                    cols: enemy.sprite.cols,
                    fps: enemy.sprite.fps,
                    animTime: enemy.animTime,
                    row: enemy.dirRow,
                    x: enemy.x,
                    y: enemy.y,
                    drawSize: enemy.radius * 2
                });
            }

            const ratio = clamp01(enemy.hp / enemy.maxHp);
            const barWidth = enemy.radius * 2;
            const barHeight = Math.max(3, enemy.radius * 0.35);

            const barX = enemy.x - barWidth / 2;
            const barY = enemy.y - enemy.radius - barHeight - 4;

            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(barX, barY, barWidth, barHeight);

            if (ratio > 0.5) ctx.fillStyle = "#22c55e";
            else if (ratio > 0.25) ctx.fillStyle = "#f59e0b";
            else ctx.fillStyle = "#ef4444";

            ctx.fillRect(barX, barY, barWidth * ratio, barHeight);

            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }

        if (world.waypoints.length >= 2) {
            ctx.strokeStyle = "rgba(30, 209, 33, 0.25)";
            ctx.lineWidth = Math.max(2, world.tileSize * 0.1);
            ctx.beginPath();
            ctx.moveTo(world.waypoints[0].x, world.waypoints[0].y);
            for (let i = 1; i < world.waypoints.length; i++)
                ctx.lineTo(world.waypoints[i].x, world.waypoints[i].y);
            ctx.stroke();
        }

        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "12px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`Mode: ${speedMode} (x${speedMultiplier})`, 10, 20);
        ctx.fillText(`Selected: ${selectedTowerTypeId}`, 10, 36);
    }, [colCount, rowCount, selectedTowerTypeId, speedMode, speedMultiplier, waveIndexUi, money, waveSet.waves.length]);

    useEffect(() => {
        renderFnRef.current = renderFrame;
    }, [renderFrame]);

    const onAnimationFrame = useCallback(
        (timestampMs: number) => {
            const previous = lastTimestampRef.current || timestampMs;
            const dt = Math.min(0.05, (timestampMs - previous) / 1000);

            lastTimestampRef.current = timestampMs;

            updateGame(dt);
            renderFrame();

            animationFrameIdRef.current = window.requestAnimationFrame(onAnimationFrame);
        },
        [renderFrame, updateGame]
    );

    useEffect(() => {
        resizeCanvasToContainer();
        requestRender();

        window.addEventListener("resize", resizeCanvasToContainer);
        return () => {
            window.removeEventListener("resize", resizeCanvasToContainer);
        };
    }, [requestRender, resizeCanvasToContainer]);

    useEffect(() => {
        if (!isRunning) {
            if (animationFrameIdRef.current !== null) {
                window.cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
            requestRender();
            return;
        }

        lastTimestampRef.current = 0;
        animationFrameIdRef.current = window.requestAnimationFrame(onAnimationFrame);

        return () => {
            if (animationFrameIdRef.current !== null) {
                window.cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
        };
    }, [isRunning, onAnimationFrame, requestRender]);

    function cycleSpeedMode() {
        setSpeedMode((prev) => {
            if (prev === "pause") return "play";
            else if (prev === "play") return "fast";
            else return "pause";
        });
    }

    const speedButtonLabel =
        speedMode === "pause"
            ? "DÉMARRER (x1)"
            : speedMode === "play"
                ? "ACCÉLÉRER (x2)"
                : "PAUSE";

    const SpeedIcon = speedMode === "pause" ? Play : speedMode === "play" ? FastForward : Pause;

    return (
        <main className="w-screen h-screen bg-gray-900 flex items-stretch overflow-hidden">
            <section
                ref={containerRef}
                className="flex-1 bg-black border-8 border-yellow-500 flex items-center justify-center overflow-hidden"
            >
                <canvas ref={canvasRef} className="cursor-crosshair" />
            </section>

            <aside className="w-72 bg-gray-950 border-8 border-yellow-500 flex flex-col gap-3 text-white p-4 overflow-y-auto overflow-x-hidden">
                <div className="border-b-2 border-yellow-500 pb-2 mb-2">
                    <h1 className="font-mono text-xl font-bold text-yellow-400">TOWER DEFENSE</h1>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="border-2 border-yellow-600 bg-gray-900 p-2 text-center">
                        <div className="font-bold text-yellow-400 text-lg">${money}</div>
                        <div className="text-xs text-gray-400">Argent</div>
                    </div>

                    <div className="border-2 border-yellow-600 bg-gray-900 p-2 text-center">
                        <div className="font-bold text-blue-400 text-lg">Wave {waveIndexUi + 1}</div>
                        <div className="text-xs text-gray-400">Vague</div>
                    </div>

                    <div className="border-2 border-yellow-600 bg-gray-900 p-2 text-center">
                        <div className={`font-bold text-lg ${lives <= 5 ? 'text-red-400 animate-pulse' : 'text-red-400'}`}>
                            {lives}
                        </div>
                        <div className="text-xs text-gray-400">Vies</div>
                    </div>
                </div>

                <div className="border-b-2 border-yellow-600 pb-2 mb-2">
                    <h3 className="font-mono text-sm font-bold text-yellow-400">CHOISIR UNE TOUR</h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {towers.types.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTowerTypeId(t.id)}
                            className={[
                                "border-2 p-3 rounded transition-all text-left",
                                selectedTowerTypeId === t.id
                                    ? "border-yellow-300 bg-gray-800"
                                    : "border-yellow-600 bg-gray-900 hover:bg-gray-800"
                            ].join(" ")}
                        >
                            <div className="font-mono text-sm font-bold">{t.name}</div>
                            <div className="text-yellow-400 font-bold">${t.cost}</div>
                            <div className="text-xs text-gray-400">
                                Range: {t.range} | DPS: {(t.damage * t.fireRate).toFixed(1)}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="border-t-2 border-yellow-600 pt-3 mt-auto space-y-2">
                    <button
                        onClick={cycleSpeedMode}
                        className={[
                            "w-full p-4 border-2 font-mono font-bold flex items-center justify-center gap-2 rounded transition-all",
                            speedMode === "fast"
                                ? "bg-red-900 border-red-600 hover:bg-red-800 text-red-100"
                                : speedMode === "play"
                                    ? "bg-yellow-900 border-yellow-600 hover:bg-yellow-800 text-yellow-100"
                                    : "bg-green-900 border-green-600 hover:bg-green-800 text-green-100"
                        ].join(" ")}
                    >
                        <SpeedIcon className="w-5 h-5" />
                        {speedButtonLabel}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                        <button className="p-3 border-2 border-yellow-600 bg-gray-900 hover:bg-gray-800 rounded flex flex-col items-center transition-colors">
                            <Settings className="w-5 h-5 mb-1" />
                            <span className="text-xs">Paramètres</span>
                        </button>

                        <button className="p-3 border-2 border-yellow-600 bg-gray-900 hover:bg-gray-800 rounded flex flex-col items-center transition-colors">
                            <Save className="w-5 h-5 mb-1" />
                            <span className="text-xs">Sauvegarder</span>
                        </button>
                    </div>
                </div>
            </aside>
        </main>
    );
}