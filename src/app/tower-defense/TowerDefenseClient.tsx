"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FastForward, Pause, Play, Save, Settings, Trash2 } from "lucide-react";

import type { EnemiesJson, MapJson, TowersJson, WaveSetJson } from "./page";

import { clamp01, type Vec2 } from "./engine/math";
import type { EnemyInstance, EnemyType } from "./engine/enemy";
import { applyEnemyDamage, spawnEnemy, updateEnemies } from "./engine/enemy";
import type { TowerInstance, TowerType } from "./engine/tower";
import { placeTower, updateTowers } from "./engine/tower";

type SpeedMode = "pause" | "play" | "fast";
type UpgradePath = 0 | 1 | 2;

type ExtendedTowerInstance = TowerInstance & {
    level: number;
    upgradePath: UpgradePath;
    totalCost: number;
};

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
    const towerListRef = useRef<ExtendedTowerInstance[]>([]);
    const nextTowerIdRef = useRef(1);

    const currentWaveIndexRef = useRef(0);
    const totalSpawnedInCurrentWaveRef = useRef(0);
    const spawnTimerRef = useRef(0);
    const currentEnemyGroupIndexRef = useRef(0);
    const spawnedInCurrentEnemyGroupRef = useRef(0);
    const playerLivesRef = useRef(20);

    const [speedMode, setSpeedMode] = useState<SpeedMode>("pause");
    const [selectedTowerTypeId, setSelectedTowerTypeId] = useState("ninja_basic");
    const [selectedTowerId, setSelectedTowerId] = useState<number | null>(null);
    const [playerMoney, setPlayerMoney] = useState(420);
    const [playerLivesUI, setPlayerLivesUI] = useState(20);
    const [currentWaveIndexUI, setCurrentWaveIndexUI] = useState(0);
    const [hoveredTowerId, setHoveredTowerId] = useState<number | null>(null);

    const mapGrid = map.grid;
    const mapRowCount = mapGrid.length;
    const mapColumnCount = mapGrid[0]?.length ?? 0;

    const groundTilesetImageRef = useRef<HTMLImageElement | null>(null);
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
    const renderFunctionRef = useRef<(() => void) | null>(null);

    const requestRender = useCallback(() => {
        const renderNow = renderFunctionRef.current;
        if (renderNow === null) return;
        renderNow();
    }, []);

    const speedMultiplier = speedMode === "fast" ? 2 : speedMode === "play" ? 1 : 0;
    const isGameRunning = speedMultiplier > 0;

    const enemyTypesLookup = useMemo(() => {
        const lookupMap = new Map<string, EnemyType>();
        for (const enemyType of enemies.types) {
            lookupMap.set(enemyType.id, enemyType as EnemyType);
        }
        return lookupMap;
    }, [enemies.types]);

    const towerTypesLookup = useMemo(() => {
        const lookupMap = new Map<string, TowerType>();
        for (const towerType of towers.types) {
            lookupMap.set(towerType.id, towerType as unknown as TowerType);
        }
        return lookupMap;
    }, [towers.types]);

    function getCanvasContext() {
        const canvas = canvasRef.current;
        if (canvas === null) return null;
        return canvas.getContext("2d");
    }

    const calculateWorldDimensions = useCallback((): World | null => {
        const container = containerRef.current;

        if (container === null || mapRowCount === 0 || mapColumnCount === 0) {
            return null;
        }

        const canvasWidth = container.clientWidth;
        const canvasHeight = container.clientHeight;
        const tileSize = Math.min(canvasWidth / mapColumnCount, canvasHeight / mapRowCount);
        const gridWidth = mapColumnCount * tileSize;
        const gridHeight = mapRowCount * tileSize;
        const gridOffsetX = (canvasWidth - gridWidth) / 2;
        const gridOffsetY = (canvasHeight - gridHeight) / 2;

        const waypoints: Vec2[] = map.path.waypoints.map((pathPoint) => ({
            x: gridOffsetX + (pathPoint.x + 0.5) * tileSize,
            y: gridOffsetY + (pathPoint.y + 0.5) * tileSize
        }));

        return {
            canvasWidth,
            canvasHeight,
            tileSize,
            gridOffsetX,
            gridOffsetY,
            waypoints
        };
    }, [mapColumnCount, mapRowCount, map.path.waypoints]);

    const resizeCanvasToMatchContainer = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (canvas === null || container === null) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const devicePixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(containerWidth * devicePixelRatio);
        canvas.height = Math.floor(containerHeight * devicePixelRatio);
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerHeight}px`;

        const context = canvas.getContext("2d");
        if (context === null) return;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(devicePixelRatio, devicePixelRatio);
        context.imageSmoothingEnabled = false;
    }, []);

    useEffect(() => {
        const tilesetImage = new Image();
        tilesetImage.src = "/textures/tileset_grass.png";
        groundTilesetImageRef.current = tilesetImage;
        tilesetImage.addEventListener("load", requestRender);

        return () => {
            tilesetImage.removeEventListener("load", requestRender);
        };
    }, [requestRender]);

    useEffect(() => {
        const enemySpriteUrls = enemies.types
            .map((enemyType) => enemyType.sprite?.src)
            .filter(Boolean) as string[];

        const towerSpriteUrls = towers.types
            .map((towerType) => towerType.sprite?.src)
            .filter(Boolean) as string[];

        const towerUpgradeVariantUrls: string[] = [];

        for (const towerType of towers.types) {
            const baseSpriteSource = towerType.sprite.src;
            const baseSpriteName = baseSpriteSource.replace(/_\d+-\d+\.png$/, '');

            for (let pathOneLevel = 0; pathOneLevel <= 4; pathOneLevel++) {
                for (let pathTwoLevel = 0; pathTwoLevel <= 4; pathTwoLevel++) {
                    if (pathOneLevel > 0 && pathTwoLevel > 0) continue;
                    towerUpgradeVariantUrls.push(`${baseSpriteName}_${pathOneLevel}-${pathTwoLevel}.png`);
                }
            }
        }

        const allUniqueImageUrls = Array.from(
            new Set([...enemySpriteUrls, ...towerSpriteUrls, ...towerUpgradeVariantUrls])
        );

        const createdImages: HTMLImageElement[] = [];

        for (const imageUrl of allUniqueImageUrls) {
            if (imageCache.current.has(imageUrl)) continue;

            const image = new Image();
            image.src = imageUrl;
            imageCache.current.set(imageUrl, image);
            createdImages.push(image);
            image.addEventListener("load", requestRender);
        }

        return () => {
            for (const image of createdImages) {
                image.removeEventListener("load", requestRender);
            }
        };
    }, [enemies.types, towers.types, requestRender]);

    const spawnEnemyFromCurrentWave = useCallback(() => {
        const worldDimensions = calculateWorldDimensions();

        if (worldDimensions === null || worldDimensions.waypoints.length < 2) {
            return;
        }

        const currentWave = waveSet.waves[currentWaveIndexRef.current] as any;
        if (!currentWave) return;

        let enemyGroupsToSpawn: Array<{ enemyId: string; count: number }> = [];

        if ('enemyId' in currentWave && 'count' in currentWave) {
            enemyGroupsToSpawn = [{ enemyId: currentWave.enemyId, count: currentWave.count }];
        }
        else if ('enemies' in currentWave) {
            enemyGroupsToSpawn = currentWave.enemies;
        }
        else {
            return;
        }

        let currentEnemyGroup = enemyGroupsToSpawn[currentEnemyGroupIndexRef.current];
        if (!currentEnemyGroup) return;

        if (spawnedInCurrentEnemyGroupRef.current >= currentEnemyGroup.count) {
            currentEnemyGroupIndexRef.current += 1;
            spawnedInCurrentEnemyGroupRef.current = 0;
            currentEnemyGroup = enemyGroupsToSpawn[currentEnemyGroupIndexRef.current];
            if (!currentEnemyGroup) return;
        }

        const enemyTypeToSpawn = enemyTypesLookup.get(currentEnemyGroup.enemyId);
        if (!enemyTypeToSpawn) return;

        const spawnResult = spawnEnemy({
            enemies: enemyListRef.current,
            nextId: nextEnemyIdRef.current,
            type: enemyTypeToSpawn,
            start: worldDimensions.waypoints[0],
            tileSize: worldDimensions.tileSize
        });

        enemyListRef.current = spawnResult.enemies;
        nextEnemyIdRef.current = spawnResult.nextId;
        spawnedInCurrentEnemyGroupRef.current += 1;
        totalSpawnedInCurrentWaveRef.current += 1;
    }, [calculateWorldDimensions, enemyTypesLookup, waveSet.waves]);

    function getMousePositionOnCanvas(mouseEvent: MouseEvent): Vec2 | null {
        const canvas = canvasRef.current;
        if (canvas === null) return null;

        const canvasBounds = canvas.getBoundingClientRect();

        return {
            x: mouseEvent.clientX - canvasBounds.left,
            y: mouseEvent.clientY - canvasBounds.top
        };
    }

    function convertCanvasPositionToGridCell(world: World, canvasPosition: Vec2) {
        return {
            gridX: Math.floor((canvasPosition.x - world.gridOffsetX) / world.tileSize),
            gridY: Math.floor((canvasPosition.y - world.gridOffsetY) / world.tileSize)
        };
    }

    const placeTowerAtGridPosition = useCallback(
        (gridX: number, gridY: number) => {
            const worldDimensions = calculateWorldDimensions();
            if (worldDimensions === null) return;

            const isInsideGrid = gridX >= 0 && gridY >= 0 && gridX < mapColumnCount && gridY < mapRowCount;
            if (!isInsideGrid) return;

            const gridCellValue = mapGrid[gridY][gridX];
            const isWallOrPath = gridCellValue === map.gridLegend.wall || gridCellValue === map.gridLegend.path;
            if (isWallOrPath) return;

            const isPositionOccupied = towerListRef.current.some(
                (tower) => tower.gridX === gridX && tower.gridY === gridY
            );
            if (isPositionOccupied) return;

            const selectedTowerType = towerTypesLookup.get(selectedTowerTypeId);
            if (!selectedTowerType || playerMoney < selectedTowerType.cost) return;

            const towerCenterPosition: Vec2 = {
                x: worldDimensions.gridOffsetX + (gridX + 0.5) * worldDimensions.tileSize,
                y: worldDimensions.gridOffsetY + (gridY + 0.5) * worldDimensions.tileSize
            };

            const placementResult = placeTower({
                towers: towerListRef.current,
                nextId: nextTowerIdRef.current,
                type: selectedTowerType,
                gridX,
                gridY,
                center: towerCenterPosition,
                tileSize: worldDimensions.tileSize
            });

            const newlyPlacedTower = placementResult.towers[placementResult.towers.length - 1];

            const extendedTower: ExtendedTowerInstance = {
                ...newlyPlacedTower,
                level: 0,
                upgradePath: 0,
                totalCost: selectedTowerType.cost
            };

            towerListRef.current = [...towerListRef.current, extendedTower];
            nextTowerIdRef.current = placementResult.nextId;

            setPlayerMoney((previousMoney) => previousMoney - selectedTowerType.cost);
            requestRender();
        },
        [
            mapColumnCount,
            mapRowCount,
            calculateWorldDimensions,
            mapGrid,
            map.gridLegend.path,
            map.gridLegend.wall,
            playerMoney,
            requestRender,
            selectedTowerTypeId,
            towerTypesLookup
        ]
    );

    const calculateUpgradeCost = (tower: ExtendedTowerInstance): number => {
        const baseTowerType = towerTypesLookup.get(tower.typeId);
        if (!baseTowerType) return 999;
        return Math.floor(baseTowerType.cost * (1.5 ** (tower.level + 1)));
    };

    const calculateSellValue = (tower: ExtendedTowerInstance): number => {
        return Math.floor(tower.totalCost * 0.7);
    };

    const upgradeTowerById = useCallback((towerId: number, upgradePath: 1 | 2) => {
        const towerIndex = towerListRef.current.findIndex((tower) => tower.id === towerId);
        if (towerIndex === -1) return;

        const towerToUpgrade = towerListRef.current[towerIndex];
        const upgradeCost = calculateUpgradeCost(towerToUpgrade);
        if (playerMoney < upgradeCost) return;

        const newUpgradePath = towerToUpgrade.level === 0 ? upgradePath : towerToUpgrade.upgradePath;
        const baseTowerType = towerTypesLookup.get(towerToUpgrade.typeId);
        if (!baseTowerType) return;

        let damageMultiplier = 1;
        let rangeMultiplier = 1;
        let fireRateMultiplier = 1;

        if (newUpgradePath === 1) {
            damageMultiplier = 1 + (towerToUpgrade.level + 1) * 0.35;
            fireRateMultiplier = 1 + (towerToUpgrade.level + 1) * 0.25;
            rangeMultiplier = 1 + (towerToUpgrade.level + 1) * 0.1;
        }
        else {
            rangeMultiplier = 1 + (towerToUpgrade.level + 1) * 0.3;
            damageMultiplier = 1 + (towerToUpgrade.level + 1) * 0.2;
            fireRateMultiplier = 1 + (towerToUpgrade.level + 1) * 0.2;
        }

        const worldDimensions = calculateWorldDimensions();
        if (!worldDimensions) return;

        const upgradedTower: ExtendedTowerInstance = {
            ...towerToUpgrade,
            level: towerToUpgrade.level + 1,
            upgradePath: newUpgradePath,
            totalCost: towerToUpgrade.totalCost + upgradeCost,
            damage: Math.round(baseTowerType.damage * damageMultiplier),
            fireRate: baseTowerType.fireRate * fireRateMultiplier,
            rangePx: baseTowerType.range * worldDimensions.tileSize * rangeMultiplier
        };

        const baseSpriteSource = baseTowerType.sprite.src;
        const baseSpriteName = baseSpriteSource.replace(/_\d+-\d+\.png$/, '');

        let pathOneLevelForSprite = 0;
        let pathTwoLevelForSprite = 0;

        if (upgradedTower.upgradePath === 1) {
            pathOneLevelForSprite = upgradedTower.level;
        }
        else if (upgradedTower.upgradePath === 2) {
            pathTwoLevelForSprite = upgradedTower.level;
        }

        const newSpriteSource = `${baseSpriteName}_${pathOneLevelForSprite}-${pathTwoLevelForSprite}.png`;

        upgradedTower.sprite = {
            ...towerToUpgrade.sprite,
            src: newSpriteSource
        };

        const updatedTowerList = [...towerListRef.current];
        updatedTowerList[towerIndex] = upgradedTower;
        towerListRef.current = updatedTowerList;

        setPlayerMoney((previousMoney) => previousMoney - upgradeCost);
        requestRender();
    }, [playerMoney, calculateWorldDimensions, towerTypesLookup, requestRender]);

    const sellTowerById = useCallback((towerId: number) => {
        const towerIndex = towerListRef.current.findIndex((tower) => tower.id === towerId);
        if (towerIndex === -1) return;

        const towerToSell = towerListRef.current[towerIndex];
        const sellValue = calculateSellValue(towerToSell);

        towerListRef.current = towerListRef.current.filter((tower) => tower.id !== towerId);
        setPlayerMoney((previousMoney) => previousMoney + sellValue);
        setSelectedTowerId(null);
        requestRender();
    }, [requestRender]);

    const selectTowerAtGridPosition = useCallback((gridX: number, gridY: number) => {
        const foundTower = towerListRef.current.find(
            (tower) => tower.gridX === gridX && tower.gridY === gridY
        );

        if (foundTower) {
            setSelectedTowerId(foundTower.id);
        }
        else {
            setSelectedTowerId(null);
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return;

        const handleMouseMove = (mouseEvent: MouseEvent) => {
            const worldDimensions = calculateWorldDimensions();
            if (worldDimensions === null) return;

            const mousePosition = getMousePositionOnCanvas(mouseEvent);
            if (mousePosition === null) return;

            const gridCell = convertCanvasPositionToGridCell(worldDimensions, mousePosition);
            const towerAtPosition = towerListRef.current.find(
                (tower) => tower.gridX === gridCell.gridX && tower.gridY === gridCell.gridY
            );

            if (towerAtPosition) {
                setHoveredTowerId(towerAtPosition.id);
                canvas.style.cursor = "pointer";
            }
            else {
                setHoveredTowerId(null);
                canvas.style.cursor = "crosshair";
            }
        };

        canvas.addEventListener("mousemove", handleMouseMove);

        return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
        };
    }, [calculateWorldDimensions]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return;

        const handleClick = (mouseEvent: MouseEvent) => {
            const worldDimensions = calculateWorldDimensions();
            if (worldDimensions === null) return;

            const mousePosition = getMousePositionOnCanvas(mouseEvent);
            if (mousePosition === null) return;

            const isGameOver = playerLivesRef.current === 0;
            const currentWaveIndex = currentWaveIndexRef.current;
            const totalWaves = waveSet.waves.length;
            const isVictory = currentWaveIndex >= totalWaves;

            if (isGameOver || isVictory) {
                const buttonY = worldDimensions.canvasHeight / 2 + 150;

                const replayButtonX = worldDimensions.canvasWidth / 2 - 260;
                const isClickingReplayButton = mousePosition.x >= replayButtonX &&
                    mousePosition.x <= replayButtonX + 240 &&
                    mousePosition.y >= buttonY &&
                    mousePosition.y <= buttonY + 60;

                if (isClickingReplayButton) {
                    window.location.reload();
                    return;
                }

                const portfolioButtonX = worldDimensions.canvasWidth / 2 + 20;
                const isClickingPortfolioButton = mousePosition.x >= portfolioButtonX &&
                    mousePosition.x <= portfolioButtonX + 240 &&
                    mousePosition.y >= buttonY &&
                    mousePosition.y <= buttonY + 60;

                if (isClickingPortfolioButton) {
                    window.location.href = "/";
                    return;
                }
            }

            const gridCell = convertCanvasPositionToGridCell(worldDimensions, mousePosition);
            const existingTower = towerListRef.current.find(
                (tower) => tower.gridX === gridCell.gridX && tower.gridY === gridCell.gridY
            );

            if (existingTower) {
                selectTowerAtGridPosition(gridCell.gridX, gridCell.gridY);
            }
            else {
                placeTowerAtGridPosition(gridCell.gridX, gridCell.gridY);
            }
        };

        canvas.addEventListener("click", handleClick);

        return () => {
            canvas.removeEventListener("click", handleClick);
        };
    }, [calculateWorldDimensions, placeTowerAtGridPosition, selectTowerAtGridPosition, waveSet.waves.length]);

    const updateGame = useCallback(
        (deltaTime: number) => {
            if (speedMultiplier <= 0) return;

            const scaledDeltaTime = deltaTime * speedMultiplier;
            const currentWave = waveSet.waves[currentWaveIndexRef.current] as any;
            if (!currentWave) return;

            let totalEnemiesInWave = 0;

            if ('count' in currentWave) {
                totalEnemiesInWave = currentWave.count;
            }
            else if ('enemies' in currentWave) {
                totalEnemiesInWave = currentWave.enemies.reduce((sum: number, group: any) => sum + group.count, 0);
            }

            spawnTimerRef.current += scaledDeltaTime;

            while (spawnTimerRef.current >= currentWave.intervalSec) {
                spawnTimerRef.current -= currentWave.intervalSec;
                spawnEnemyFromCurrentWave();

                if (totalSpawnedInCurrentWaveRef.current >= totalEnemiesInWave) break;
            }

            const worldDimensions = calculateWorldDimensions();
            if (worldDimensions === null) return;

            const enemyUpdate = updateEnemies({
                enemies: enemyListRef.current,
                dt: scaledDeltaTime,
                waypoints: worldDimensions.waypoints
            });

            const towerUpdate = updateTowers({
                towers: towerListRef.current,
                enemies: enemyUpdate.enemies.map((enemy) => ({ id: enemy.id, x: enemy.x, y: enemy.y })),
                dt: scaledDeltaTime
            });

            const enemiesAfterDamage = applyEnemyDamage(enemyUpdate.enemies, towerUpdate.damageEvents);

            // Préserver les propriétés étendues des tours
            const updatedTowers: ExtendedTowerInstance[] = towerUpdate.towers.map((updatedTower) => {
                const existingTower = towerListRef.current.find((t) => t.id === updatedTower.id);
                if (existingTower) {
                    return {
                        ...updatedTower,
                        level: existingTower.level,
                        upgradePath: existingTower.upgradePath,
                        totalCost: existingTower.totalCost
                    } as ExtendedTowerInstance;
                }
                // Cela ne devrait jamais arriver, mais par sécurité
                return {
                    ...updatedTower,
                    level: 0,
                    upgradePath: 0,
                    totalCost: 0
                } as ExtendedTowerInstance;
            });

            let moneyEarned = 0;

            for (const damageEvent of towerUpdate.damageEvents) {
                const enemyBefore = enemyUpdate.enemies.find((enemy) => enemy.id === damageEvent.enemyId);
                const enemyAfter = enemiesAfterDamage.find((enemy) => enemy.id === damageEvent.enemyId);

                if (enemyBefore && !enemyAfter) {
                    const enemyType = enemyTypesLookup.get(enemyBefore.typeId);
                    moneyEarned += enemyType?.reward ?? 1;
                }
            }

            if (moneyEarned > 0) {
                setPlayerMoney((previousMoney) => previousMoney + moneyEarned);
            }

            if (enemyUpdate.escapedCount > 0) {
                playerLivesRef.current = Math.max(0, playerLivesRef.current - enemyUpdate.escapedCount);
                setPlayerLivesUI(playerLivesRef.current);
            }

            const doneSpawning = totalSpawnedInCurrentWaveRef.current >= totalEnemiesInWave;
            const noEnemiesLeft = enemiesAfterDamage.length === 0;

            if (doneSpawning && noEnemiesLeft) {
                if (currentWaveIndexRef.current < waveSet.waves.length) {
                    currentWaveIndexRef.current += 1;
                    totalSpawnedInCurrentWaveRef.current = 0;
                    spawnTimerRef.current = 0;
                    currentEnemyGroupIndexRef.current = 0;
                    spawnedInCurrentEnemyGroupRef.current = 0;
                    setCurrentWaveIndexUI(currentWaveIndexRef.current);

                    if (currentWaveIndexRef.current < waveSet.waves.length) {
                        setPlayerMoney((previousMoney) => previousMoney + 20);
                    }
                }
            }

            enemyListRef.current = enemiesAfterDamage;
            towerListRef.current = updatedTowers;
        },
        [calculateWorldDimensions, spawnEnemyFromCurrentWave, speedMultiplier, waveSet.waves, enemyTypesLookup]
    );

    function drawSpriteFrame(context: CanvasRenderingContext2D, params: SpriteDrawParams) {
        const spriteImage = imageCache.current.get(params.spriteSrc);
        if (!spriteImage || !spriteImage.complete) return;

        const currentColumn = Math.floor(params.animTime * params.fps) % params.cols;
        const sourceX = currentColumn * params.frameSize;
        const sourceY = params.row * params.frameSize;

        context.drawImage(
            spriteImage,
            sourceX,
            sourceY,
            params.frameSize,
            params.frameSize,
            params.x - params.drawSize / 2,
            params.y - params.drawSize / 2,
            params.drawSize,
            params.drawSize
        );
    }

    const renderFrame = useCallback(() => {
        const context = getCanvasContext();
        const worldDimensions = calculateWorldDimensions();

        if (context === null || worldDimensions === null) return;

        if (playerLivesRef.current === 0) {
            context.fillStyle = "rgba(139, 0, 0, 0.95)";
            context.fillRect(0, 0, worldDimensions.canvasWidth, worldDimensions.canvasHeight);

            context.strokeStyle = "#ff3333";
            context.lineWidth = 8;
            context.strokeRect(20, 20, worldDimensions.canvasWidth - 40, worldDimensions.canvasHeight - 40);

            context.fillStyle = "#ff6666";
            context.font = "bold 72px monospace";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.shadowColor = "rgba(255, 0, 0, 0.8)";
            context.shadowBlur = 20;
            context.fillText("GAME OVER", worldDimensions.canvasWidth / 2, worldDimensions.canvasHeight / 2 - 80);

            context.shadowBlur = 0;
            context.fillStyle = "#ff9999";
            context.font = "bold 32px monospace";
            context.fillText("Toutes vos tours ont été dépassées", worldDimensions.canvasWidth / 2, worldDimensions.canvasHeight / 2 - 20);

            context.fillStyle = "#ffffff";
            context.font = "24px monospace";
            context.fillText(`Wave ${currentWaveIndexUI + 1} terminée`, worldDimensions.canvasWidth / 2, worldDimensions.canvasHeight / 2 + 50);
            context.fillText(`Argent final: $${playerMoney}`, worldDimensions.canvasWidth / 2, worldDimensions.canvasHeight / 2 + 90);

            const buttonY = worldDimensions.canvasHeight / 2 + 150;

            context.fillStyle = "#ff4444";
            context.fillRect(worldDimensions.canvasWidth / 2 - 260, buttonY, 240, 60);
            context.strokeStyle = "#ffffff";
            context.lineWidth = 3;
            context.strokeRect(worldDimensions.canvasWidth / 2 - 260, buttonY, 240, 60);

            context.fillStyle = "#ffffff";
            context.font = "bold 22px monospace";
            context.textBaseline = "middle";
            context.fillText("REJOUER", worldDimensions.canvasWidth / 2 - 140, buttonY + 30);

            context.fillStyle = "#4a90e2";
            context.fillRect(worldDimensions.canvasWidth / 2 + 20, buttonY, 240, 60);
            context.strokeStyle = "#ffffff";
            context.lineWidth = 3;
            context.strokeRect(worldDimensions.canvasWidth / 2 + 20, buttonY, 240, 60);

            context.fillStyle = "#ffffff";
            context.fillText("PORTFOLIO", worldDimensions.canvasWidth / 2 + 140, buttonY + 30);
            context.textAlign = "left";
            context.textBaseline = "alphabetic";
            return;
        }

        const currentWaveIndex = currentWaveIndexRef.current;
        const totalWaves = waveSet.waves.length;

        if (currentWaveIndex >= totalWaves && playerLivesRef.current > 0) {
            context.fillStyle = "rgba(255, 215, 0, 0.95)";
            context.fillRect(0, 0, worldDimensions.canvasWidth, worldDimensions.canvasHeight);

            context.strokeStyle = "#ffd700";
            context.lineWidth = 8;
            context.strokeRect(20, 20, worldDimensions.canvasWidth - 40, worldDimensions.canvasHeight - 40);

            context.fillStyle = "#ffeb3b";
            context.font = "bold 72px monospace";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.shadowColor = "rgba(255, 215, 0, 0.8)";
            context.shadowBlur = 20;
            context.fillText("VICTOIRE !", worldDimensions.canvasWidth / 2, worldDimensions.canvasHeight / 2 - 80);

            context.shadowBlur = 0;
            context.fillStyle = "#fff176";
            context.font = "bold 32px monospace";
            context.fillText("Toutes les vagues vaincues !", worldDimensions.canvasWidth / 2, worldDimensions.canvasHeight / 2 - 20);

            context.fillStyle = "#ffffff";
            context.font = "24px monospace";
            context.fillText(`Wave ${totalWaves} terminée`, worldDimensions.canvasWidth / 2, worldDimensions.canvasHeight / 2 + 50);
            context.fillText(`Score final: $${playerMoney}`, worldDimensions.canvasWidth / 2, worldDimensions.canvasHeight / 2 + 90);

            const buttonY = worldDimensions.canvasHeight / 2 + 150;

            context.fillStyle = "#4caf50";
            context.fillRect(worldDimensions.canvasWidth / 2 - 260, buttonY, 240, 60);
            context.strokeStyle = "#ffffff";
            context.lineWidth = 3;
            context.strokeRect(worldDimensions.canvasWidth / 2 - 260, buttonY, 240, 60);

            context.fillStyle = "#ffffff";
            context.font = "bold 22px monospace";
            context.textBaseline = "middle";
            context.fillText("REJOUER", worldDimensions.canvasWidth / 2 - 140, buttonY + 30);

            context.fillStyle = "#4a90e2";
            context.fillRect(worldDimensions.canvasWidth / 2 + 20, buttonY, 240, 60);
            context.strokeStyle = "#ffffff";
            context.lineWidth = 3;
            context.strokeRect(worldDimensions.canvasWidth / 2 + 20, buttonY, 240, 60);

            context.fillStyle = "#ffffff";
            context.fillText("PORTFOLIO", worldDimensions.canvasWidth / 2 + 140, buttonY + 30);
            context.textAlign = "left";
            context.textBaseline = "alphabetic";
            return;
        }

        context.fillStyle = "#000";
        context.fillRect(0, 0, worldDimensions.canvasWidth, worldDimensions.canvasHeight);

        const tilesetImage = groundTilesetImageRef.current;
        const sourceTileSize = 32;
        const sourceColumn = 0;
        const sourceRow = 7;
        const sourceX = sourceColumn * sourceTileSize;
        const sourceY = sourceRow * sourceTileSize;

        if (tilesetImage && tilesetImage.complete) {
            for (let gridY = 0; gridY < mapRowCount; gridY++) {
                for (let gridX = 0; gridX < mapColumnCount; gridX++) {
                    const destinationX = worldDimensions.gridOffsetX + gridX * worldDimensions.tileSize;
                    const destinationY = worldDimensions.gridOffsetY + gridY * worldDimensions.tileSize;

                    context.drawImage(
                        tilesetImage,
                        sourceX,
                        sourceY,
                        sourceTileSize,
                        sourceTileSize,
                        destinationX,
                        destinationY,
                        worldDimensions.tileSize,
                        worldDimensions.tileSize
                    );
                }
            }
        }
        else {
            context.fillStyle = "#064e3b";
            context.fillRect(
                worldDimensions.gridOffsetX,
                worldDimensions.gridOffsetY,
                mapColumnCount * worldDimensions.tileSize,
                mapRowCount * worldDimensions.tileSize
            );
        }

        context.strokeStyle = "rgba(0,0,0,0.25)";
        context.lineWidth = 1;

        for (let x = 0; x <= mapColumnCount; x++) {
            context.beginPath();
            context.moveTo(
                worldDimensions.gridOffsetX + x * worldDimensions.tileSize,
                worldDimensions.gridOffsetY
            );
            context.lineTo(
                worldDimensions.gridOffsetX + x * worldDimensions.tileSize,
                worldDimensions.gridOffsetY + mapRowCount * worldDimensions.tileSize
            );
            context.stroke();
        }

        for (let y = 0; y <= mapRowCount; y++) {
            context.beginPath();
            context.moveTo(
                worldDimensions.gridOffsetX,
                worldDimensions.gridOffsetY + y * worldDimensions.tileSize
            );
            context.lineTo(
                worldDimensions.gridOffsetX + mapColumnCount * worldDimensions.tileSize,
                worldDimensions.gridOffsetY + y * worldDimensions.tileSize
            );
            context.stroke();
        }

        for (const tower of towerListRef.current) {
            drawSpriteFrame(context, {
                spriteSrc: tower.sprite.src,
                frameSize: tower.sprite.frameSize,
                cols: tower.sprite.cols,
                fps: tower.sprite.fps,
                animTime: tower.animTime,
                row: tower.dirRow,
                x: tower.x,
                y: tower.y,
                drawSize: worldDimensions.tileSize * 1.35
            });

            if (selectedTowerId === tower.id) {
                context.strokeStyle = "#ffeb3b";
                context.lineWidth = 4;
                context.beginPath();
                context.arc(tower.x, tower.y, worldDimensions.tileSize * 0.6, 0, 2 * Math.PI);
                context.stroke();
            }

            if (tower.level > 0) {
                const levelIndicatorSize = worldDimensions.tileSize * 0.25;
                context.fillStyle = tower.upgradePath === 1 ? "#ff4444" : "#4444ff";
                context.beginPath();
                context.arc(
                    tower.x + worldDimensions.tileSize * 0.4,
                    tower.y - worldDimensions.tileSize * 0.4,
                    levelIndicatorSize,
                    0,
                    2 * Math.PI
                );
                context.fill();

                context.fillStyle = "#ffffff";
                context.font = `bold ${levelIndicatorSize * 1.4}px monospace`;
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(
                    tower.level.toString(),
                    tower.x + worldDimensions.tileSize * 0.4,
                    tower.y - worldDimensions.tileSize * 0.4
                );
            }

            if (speedMode === "pause") {
                context.strokeStyle = "rgba(59,130,246,0.35)";
                context.lineWidth = 2;
                context.beginPath();
                context.arc(tower.x, tower.y, tower.rangePx, 0, 2 * Math.PI);
                context.stroke();
            }
        }

        for (const enemy of enemyListRef.current) {
            if (enemy.sprite) {
                drawSpriteFrame(context, {
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

            const healthRatio = clamp01(enemy.hp / enemy.maxHp);
            const healthBarWidth = enemy.radius * 2;
            const healthBarHeight = Math.max(3, enemy.radius * 0.35);
            const healthBarX = enemy.x - healthBarWidth / 2;
            const healthBarY = enemy.y - enemy.radius - healthBarHeight - 4;

            context.fillStyle = "rgba(0,0,0,0.6)";
            context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

            if (healthRatio > 0.5) {
                context.fillStyle = "#22c55e";
            }
            else if (healthRatio > 0.25) {
                context.fillStyle = "#f59e0b";
            }
            else {
                context.fillStyle = "#ef4444";
            }

            context.fillRect(healthBarX, healthBarY, healthBarWidth * healthRatio, healthBarHeight);

            context.strokeStyle = "rgba(255,255,255,0.25)";
            context.lineWidth = 1;
            context.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        }

        if (worldDimensions.waypoints.length >= 2) {
            context.strokeStyle = "rgba(30, 209, 33, 0.25)";
            context.lineWidth = Math.max(2, worldDimensions.tileSize * 0.1);
            context.beginPath();
            context.moveTo(worldDimensions.waypoints[0].x, worldDimensions.waypoints[0].y);

            for (let i = 1; i < worldDimensions.waypoints.length; i++) {
                context.lineTo(worldDimensions.waypoints[i].x, worldDimensions.waypoints[i].y);
            }

            context.stroke();
        }

        context.fillStyle = "rgba(255,255,255,0.85)";
        context.font = "12px monospace";
        context.textAlign = "left";
        context.textBaseline = "alphabetic";
        context.fillText(`Mode: ${speedMode} (x${speedMultiplier})`, 10, 20);
        context.fillText(`Selected: ${selectedTowerTypeId}`, 10, 36);
    }, [mapColumnCount, mapRowCount, selectedTowerTypeId, speedMode, speedMultiplier, currentWaveIndexUI, playerMoney, waveSet.waves.length, selectedTowerId]);

    useEffect(() => {
        renderFunctionRef.current = renderFrame;
    }, [renderFrame]);

    const onAnimationFrame = useCallback(
        (timestampMilliseconds: number) => {
            const previousTimestamp = lastTimestampRef.current || timestampMilliseconds;
            const deltaTime = Math.min(0.05, (timestampMilliseconds - previousTimestamp) / 1000);

            lastTimestampRef.current = timestampMilliseconds;

            updateGame(deltaTime);
            renderFrame();

            animationFrameIdRef.current = window.requestAnimationFrame(onAnimationFrame);
        },
        [renderFrame, updateGame]
    );

    useEffect(() => {
        resizeCanvasToMatchContainer();
        requestRender();

        window.addEventListener("resize", resizeCanvasToMatchContainer);

        return () => {
            window.removeEventListener("resize", resizeCanvasToMatchContainer);
        };
    }, [requestRender, resizeCanvasToMatchContainer]);

    useEffect(() => {
        if (!isGameRunning) {
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
    }, [isGameRunning, onAnimationFrame, requestRender]);

    function toggleSpeedMode() {
        setSpeedMode((previousMode) => {
            if (previousMode === "pause") return "play";
            if (previousMode === "play") return "fast";
            return "pause";
        });
    }

    const speedButtonLabel = speedMode === "pause"
        ? "DÉMARRER (x1)"
        : speedMode === "play"
            ? "ACCÉLÉRER (x2)"
            : "PAUSE";

    const SpeedIcon = speedMode === "pause"
        ? Play
        : speedMode === "play"
            ? FastForward
            : Pause;

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
                        <div className="font-bold text-yellow-400 text-lg">${playerMoney}</div>
                        <div className="text-xs text-gray-400">Argent</div>
                    </div>

                    <div className="border-2 border-yellow-600 bg-gray-900 p-2 text-center">
                        <div className="font-bold text-blue-400 text-lg">Wave {currentWaveIndexUI + 1}</div>
                        <div className="text-xs text-gray-400">Vague</div>
                    </div>

                    <div className="border-2 border-yellow-600 bg-gray-900 p-2 text-center">
                        <div className={`font-bold text-lg ${playerLivesUI <= 5 ? 'text-red-400 animate-pulse' : 'text-red-400'}`}>
                            {playerLivesUI}
                        </div>
                        <div className="text-xs text-gray-400">Vies</div>
                    </div>
                </div>

                <div className="border-b-2 border-yellow-600 pb-2 mb-2">
                    <h3 className="font-mono text-sm font-bold text-yellow-400">CHOISIR UNE TOUR</h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {towers.types.map((towerType) => (
                        <button
                            key={towerType.id}
                            onClick={() => setSelectedTowerTypeId(towerType.id)}
                            className={[
                                "border-2 p-3 rounded transition-all text-left",
                                selectedTowerTypeId === towerType.id
                                    ? "border-yellow-300 bg-gray-800"
                                    : "border-yellow-600 bg-gray-900 hover:bg-gray-800"
                            ].join(" ")}
                        >
                            <div className="font-mono text-sm font-bold">{towerType.name}</div>
                            <div className="text-yellow-400 font-bold">${towerType.cost}</div>
                            <div className="text-xs text-gray-400">
                                Range: {towerType.range} | DPS: {(towerType.damage * towerType.fireRate).toFixed(1)}
                            </div>
                        </button>
                    ))}
                </div>

                {selectedTowerId !== null && (() => {
                    const selectedTower = towerListRef.current.find((tower) => tower.id === selectedTowerId);
                    if (!selectedTower) return null;

                    const upgradeCost = calculateUpgradeCost(selectedTower);
                    const sellValue = calculateSellValue(selectedTower);
                    const baseTowerType = towerTypesLookup.get(selectedTower.typeId);

                    return (
                        <div className="border-2 border-yellow-400 bg-gray-800 p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-mono text-sm font-bold text-yellow-400">
                                    TOUR SÉLECTIONNÉE
                                </h3>
                                <button
                                    onClick={() => setSelectedTowerId(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mb-3">
                                <div className="font-bold text-white">{baseTowerType?.name}</div>
                                <div className="text-xs text-gray-400">
                                    {selectedTower.upgradePath > 0 && `Path ${selectedTower.upgradePath}`}
                                </div>
                                <div className="text-xs text-blue-400 mt-1">
                                    DMG: {selectedTower.damage} | Range: {(selectedTower.rangePx / calculateWorldDimensions()!.tileSize).toFixed(1)} | Fire: {selectedTower.fireRate.toFixed(1)}/s
                                </div>
                            </div>

                            <div className="mb-3 flex gap-1">
                                {[0, 1, 2, 3].map((levelIndex) => (
                                    <div
                                        key={levelIndex}
                                        className={[
                                            "flex-1 h-3 rounded transition-all",
                                            levelIndex < selectedTower.level
                                                ? selectedTower.upgradePath === 1
                                                    ? "bg-red-500"
                                                    : selectedTower.upgradePath === 2
                                                        ? "bg-blue-500"
                                                        : "bg-gray-500"
                                                : "bg-gray-700 border border-gray-600"
                                        ].join(" ")}
                                    />
                                ))}
                            </div>

                            {selectedTower.level === 0 && (
                                <div className="space-y-2 mb-2">
                                    <div className="text-xs text-gray-400 mb-1">Choisir un chemin d'upgrade:</div>

                                    <button
                                        onClick={() => upgradeTowerById(selectedTower.id, 1)}
                                        disabled={playerMoney < upgradeCost}
                                        className={[
                                            "w-full p-2 border-2 rounded text-left transition-all",
                                            playerMoney >= upgradeCost
                                                ? "border-red-600 bg-gray-900 hover:bg-gray-800"
                                                : "border-gray-600 bg-gray-900 opacity-50 cursor-not-allowed"
                                        ].join(" ")}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <div className="font-bold text-xs text-red-400">PATH 1: Dégâts</div>
                                                <div className="text-xs text-gray-400">+35% DMG, +25% Fire Rate</div>
                                            </div>
                                            <div className="text-yellow-400 font-bold text-sm">${upgradeCost}</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => upgradeTowerById(selectedTower.id, 2)}
                                        disabled={playerMoney < upgradeCost}
                                        className={[
                                            "w-full p-2 border-2 rounded text-left transition-all",
                                            playerMoney >= upgradeCost
                                                ? "border-blue-600 bg-gray-900 hover:bg-gray-800"
                                                : "border-gray-600 bg-gray-900 opacity-50 cursor-not-allowed"
                                        ].join(" ")}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <div className="font-bold text-xs text-blue-400">PATH 2: Portée</div>
                                                <div className="text-xs text-gray-400">+30% Range, +20% DPS</div>
                                            </div>
                                            <div className="text-yellow-400 font-bold text-sm">${upgradeCost}</div>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {selectedTower.level > 0 && selectedTower.level < 4 && (
                                <button
                                    onClick={() => upgradeTowerById(selectedTower.id, selectedTower.upgradePath as 1 | 2)}
                                    disabled={playerMoney < upgradeCost}
                                    className={[
                                        "w-full p-2 border-2 rounded mb-2 transition-all flex items-center gap-2",
                                        playerMoney >= upgradeCost
                                            ? selectedTower.upgradePath === 1
                                                ? "border-red-600 bg-gray-900 hover:bg-gray-800"
                                                : "border-blue-600 bg-gray-900 hover:bg-gray-800"
                                            : "border-gray-600 bg-gray-900 opacity-50 cursor-not-allowed"
                                    ].join(" ")}
                                >
                                    <div className="flex-1 text-left">
                                        <div className="font-bold text-xs text-white">UPGRADE</div>
                                        <div className="text-xs text-gray-400">Path {selectedTower.upgradePath}</div>
                                    </div>
                                    <div className="text-yellow-400 font-bold">${upgradeCost}</div>
                                </button>
                            )}

                            {selectedTower.level >= 4 && (
                                <div className="p-2 bg-gray-900 border-2 border-green-600 rounded mb-2 text-center">
                                    <div className="text-xs font-bold text-green-400">NIVEAU MAX</div>
                                </div>
                            )}

                            <button
                                onClick={() => sellTowerById(selectedTower.id)}
                                className="w-full p-2 border-2 border-gray-600 bg-gray-900 hover:bg-gray-800 rounded transition-all flex items-center justify-center"
                                title={`Vendre pour $${sellValue}`}
                            >
                                <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-400" />
                            </button>
                        </div>
                    );
                })()}

                <div className="border-t-2 border-yellow-600 pt-3 mt-auto space-y-2">
                    <button
                        onClick={toggleSpeedMode}
                        className={[
                            "w-full p-4 border-2 font-mono font-bold flex items-center justify-center gap-2 rounded transition-all",
                            speedMode === "fast"
                                ? "bg-gray-900 border-red-600 hover:bg-gray-800 text-red-100"
                                : speedMode === "play"
                                    ? "bg-gray-900 border-yellow-600 hover:bg-gray-800 text-yellow-100"
                                    : "bg-gray-900 border-green-600 hover:bg-gray-800 text-green-100"
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