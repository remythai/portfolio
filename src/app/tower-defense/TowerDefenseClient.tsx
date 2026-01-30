"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, FastForward, Settings, Save } from "lucide-react";
import type { EnemiesJson, MapJson, WaveSetJson } from "./page";
import { clamp01 } from "./engine/math";
import type { EnemyType, EnemyInstance } from "./engine/enemy";
import { spawnEnemy, updateEnemies } from "./engine/enemy";

type Vec2 = { x: number; y: number };

export default function TowerDefenseClient({
  map,
  enemies,
  waveSet
}: {
  map: MapJson;
  enemies: EnemiesJson;
  waveSet: WaveSetJson;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const enemiesRef = useRef<EnemyInstance[]>([]);
  const nextEnemyIdRef = useRef(1);

  const waveIndexRef = useRef(0);
  const spawnedInWaveRef = useRef(0);
  const spawnAccumulatorRef = useRef(0);

  const [speedMode, setSpeedMode] = useState<"pause" | "play" | "fast">("pause");
  const isPlaying = speedMode !== "pause";
  const speedMultiplier = speedMode === "fast" ? 2 : 1;

  const tilesetGroundRef = useRef<HTMLImageElement | null>(null);
  const spriteCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const renderRef = useRef<(() => void) | null>(null);
  const requestRender = useCallback(() => {
    renderRef.current?.();
  }, []);

  const money = 420;
  const lives = 20;

  const grid = map.grid;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const enemyTypesById = useMemo(() => {
    const m = new Map<string, EnemyType>();
    for (const t of enemies.types) m.set(t.id, t as EnemyType);
    return m;
  }, [enemies.types]);

  const towers = useMemo(
    () => [
      { name: "miaou basic", cost: 50, color: "bg-blue-500" },
      { name: "miaou basic", cost: 50, color: "bg-blue-500" },
      { name: "miaou basic", cost: 50, color: "bg-blue-500" }
    ],
    []
  );

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  };

  const getWorld = useCallback(() => {
    const container = containerRef.current;
    if (!container || !rows || !cols) return null;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const tileSize = Math.min(w / cols, h / rows);
    const gridW = cols * tileSize;
    const gridH = rows * tileSize;

    const offsetX = (w - gridW) / 2;
    const offsetY = (h - gridH) / 2;

    const waypoints: Vec2[] = map.path.waypoints.map((p) => ({
      x: offsetX + (p.x + 0.5) * tileSize,
      y: offsetY + (p.y + 0.5) * tileSize
    }));

    return { w, h, tileSize, offsetX, offsetY, waypoints };
  }, [cols, rows, map.path.waypoints]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = "/textures/tileset_grass.png";
    tilesetGroundRef.current = img;

    img.addEventListener("load", requestRender);
    return () => img.removeEventListener("load", requestRender);
  }, [requestRender]);

  useEffect(() => {
    const urls = enemies.types.map((t) => t.sprite?.src).filter(Boolean) as string[];
    const uniq = Array.from(new Set(urls));

    const imgs: HTMLImageElement[] = [];

    for (const url of uniq) {
      if (spriteCacheRef.current.has(url)) continue;
      const img = new Image();
      img.src = url;
      spriteCacheRef.current.set(url, img);
      imgs.push(img);
      img.addEventListener("load", requestRender);
    }

    return () => {
      for (const img of imgs) img.removeEventListener("load", requestRender);
    };
  }, [enemies.types, requestRender]);

  const spawnEnemyFromCurrentWave = useCallback(() => {
    const world = getWorld();
    if (!world) return;

    const { waypoints, tileSize } = world;
    if (waypoints.length < 2) return;

    const wave = waveSet.waves[waveIndexRef.current];
    if (!wave) return;

    if (spawnedInWaveRef.current >= wave.count) return;

    const type = enemyTypesById.get(wave.enemyId);
    if (!type) return;

    const result = spawnEnemy({
      enemies: enemiesRef.current,
      nextId: nextEnemyIdRef.current,
      type,
      start: waypoints[0],
      tileSize
    });

    enemiesRef.current = result.enemies;
    nextEnemyIdRef.current = result.nextId;
    spawnedInWaveRef.current += 1;
  }, [enemyTypesById, getWorld, waveSet.waves]);

  const update = useCallback(
    (dt: number) => {
      const scaledDt = dt * speedMultiplier;

      const wave = waveSet.waves[waveIndexRef.current];
      if (!wave) return;

      spawnAccumulatorRef.current += scaledDt;
      while (spawnAccumulatorRef.current >= wave.intervalSec) {
        spawnAccumulatorRef.current -= wave.intervalSec;
        spawnEnemyFromCurrentWave();
        if (spawnedInWaveRef.current >= wave.count) break;
      }

      const world = getWorld();
      if (!world) return;
      const { waypoints } = world;

      enemiesRef.current = updateEnemies({
        enemies: enemiesRef.current,
        dt: scaledDt,
        waypoints
      });

      const waveDoneSpawning = spawnedInWaveRef.current >= wave.count;
      const noEnemies = enemiesRef.current.length === 0;

      if (waveDoneSpawning && noEnemies) {
        if (waveIndexRef.current < waveSet.waves.length - 1) {
          waveIndexRef.current += 1;
          spawnedInWaveRef.current = 0;
          spawnAccumulatorRef.current = 0;
        }
      }
    },
    [getWorld, spawnEnemyFromCurrentWave, speedMultiplier, waveSet.waves]
  );

  function drawEnemySprite(ctx: CanvasRenderingContext2D, e: EnemyInstance) {
    const sprite = e.sprite;
    if (!sprite) return;

    const img = spriteCacheRef.current.get(sprite.src);
    if (!img || !img.complete) return;

    const frame = Math.floor(e.animTime * sprite.fps) % sprite.cols;

    const sx = frame * sprite.frameSize;
    const sy = e.dirRow * sprite.frameSize;
    const sw = sprite.frameSize;
    const sh = sprite.frameSize;

    const size = e.radius * 2;
    const dx = e.x - size / 2;
    const dy = e.y - size / 2;

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, size, size);
  }

  const render = useCallback(() => {
    const ctx = getCtx();
    const world = getWorld();
    if (!ctx || !world) return;

    const { w, h, tileSize, offsetX, offsetY, waypoints } = world;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const tileset = tilesetGroundRef.current;
    const TILE = 32;
    const sx = 0 * TILE;
    const sy = 7 * TILE;

    if (tileset && tileset.complete) {
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const dx = offsetX + gx * tileSize;
          const dy = offsetY + gy * tileSize;
          ctx.drawImage(tileset, sx, sy, TILE, TILE, dx, dy, tileSize, tileSize);
        }
      }
    } else {
      ctx.fillStyle = "#064e3b";
      ctx.fillRect(offsetX, offsetY, cols * tileSize, rows * tileSize);
    }

    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * tileSize, offsetY);
      ctx.lineTo(offsetX + x * tileSize, offsetY + rows * tileSize);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + y * tileSize);
      ctx.lineTo(offsetX + cols * tileSize, offsetY + y * tileSize);
      ctx.stroke();
    }

    if (waypoints.length >= 2) {
      ctx.strokeStyle = "rgba(255,255,0,0.45)";
      ctx.lineWidth = Math.max(2, tileSize * 0.12);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(waypoints[0].x, waypoints[0].y);
      for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
      ctx.stroke();
    }

    for (const e of enemiesRef.current) {
      if (e.sprite) drawEnemySprite(ctx, e);
      else {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, 2 * Math.PI);
        ctx.fill();
      }

      const barW = e.radius * 2;
      const barH = Math.max(3, e.radius * 0.35);
      const x0 = e.x - barW / 2;
      const y0 = e.y - e.radius - barH - 4;
      const ratio = clamp01(e.hp / e.maxHp);

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(x0, y0, barW, barH);
      ctx.fillStyle = ratio > 0.5 ? "#22c55e" : ratio > 0.25 ? "#f59e0b" : "#ef4444";
      ctx.fillRect(x0, y0, barW * ratio, barH);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x0, y0, barW, barH);
    }

    const wave = waveSet.waves[waveIndexRef.current];
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "12px monospace";
    ctx.fillText(speedMode === "pause" ? "PAUSED" : speedMode === "play" ? "RUN x1" : "RUN x2", 10, 20);
    ctx.fillText(`Wave: ${waveIndexRef.current + 1}/${waveSet.waves.length}`, 10, 36);
    ctx.fillText(`Spawns: ${spawnedInWaveRef.current}/${wave?.count ?? 0}`, 10, 52);
    ctx.fillText(`Enemies: ${enemiesRef.current.length}`, 10, 68);
  }, [cols, rows, getWorld, speedMode, waveSet.waves]);

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  const loop = useCallback(
    (t: number) => {
      const last = lastTimeRef.current || t;
      const dt = Math.min(0.05, (t - last) / 1000);
      lastTimeRef.current = t;

      update(dt);
      render();

      rafIdRef.current = window.requestAnimationFrame(loop);
    },
    [render, update]
  );

  useEffect(() => {
    resizeCanvas();
    render();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas, render]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      render();
      return;
    }

    lastTimeRef.current = 0;
    rafIdRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying, loop, render]);

  const toggleSpeed = () => setSpeedMode((m) => (m === "pause" ? "play" : m === "play" ? "fast" : "pause"));
  const buttonLabel = speedMode === "pause" ? "DÉMARRER (x1)" : speedMode === "play" ? "ACCÉLÉRER (x2)" : "PAUSE";
  const ButtonIcon = speedMode === "pause" ? Play : speedMode === "play" ? FastForward : Pause;

  return (
    <main className="w-screen h-screen bg-gray-900 flex items-stretch overflow-hidden">
      <section ref={containerRef} className="flex-1 bg-black border-8 border-yellow-500 flex items-center justify-center overflow-hidden">
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
            <div className="font-bold text-blue-400 text-lg">Wave {waveIndexRef.current + 1}</div>
            <div className="text-xs text-gray-400">Vague</div>
          </div>
          <div className="border-2 border-yellow-600 bg-gray-900 p-2 text-center">
            <div className="font-bold text-red-400 text-lg">{lives}</div>
            <div className="text-xs text-gray-400">Vies</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="border-b-2 border-yellow-600 pb-2 mb-3">
            <h3 className="font-mono text-sm font-bold text-yellow-400">TOURS DISPONIBLES</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 overflow-y-auto">
            {towers.map((tower, idx) => (
              <button
                key={`${tower.name}-${idx}`}
                className="border-2 border-yellow-600 bg-gray-900 p-3 rounded hover:bg-gray-800 hover:border-yellow-400 active:bg-gray-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${tower.color} rounded flex-shrink-0`} />
                  <div className="text-left flex-1">
                    <div className="font-mono text-sm font-bold">{tower.name}</div>
                    <div className="text-yellow-400 font-bold text-lg">${tower.cost}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-yellow-600 pt-3 mt-auto space-y-2">
          <button
            onClick={toggleSpeed}
            className={`w-full p-4 border-2 font-mono font-bold flex items-center justify-center gap-2 rounded transition-all ${
              speedMode === "fast"
                ? "bg-red-900 border-red-600 hover:bg-red-800 text-red-100"
                : speedMode === "play"
                  ? "bg-yellow-900 border-yellow-600 hover:bg-yellow-800 text-yellow-100"
                  : "bg-green-900 border-green-600 hover:bg-green-800 text-green-100"
            }`}
          >
            <ButtonIcon className="w-5 h-5" />
            {buttonLabel}
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
