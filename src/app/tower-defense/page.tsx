import { promises as fs } from "node:fs";
import path from "node:path";
import TowerDefenseClient from "./TowerDefenseClient";

export type MapJson = {
  id: string;
  name: string;
  gridLegend: { empty: number; wall: number; path: number };
  grid: number[][];
  path: { waypoints: { x: number; y: number }[] };
  waveSetId: string;
};

export type SpriteDefJson = {
  src: string;
  frameSize: number;
  cols: number;
  rows: number;
  fps: number;
};

export type EnemyTypeJson = {
  id: string;
  hp: number;
  speed: number;
  color: string;
  radiusScale: number;
  sprite?: SpriteDefJson;
};

export type EnemiesJson = {
  types: EnemyTypeJson[];
};

export type WaveDef = {
  enemyId: string;
  count: number;
  intervalSec: number;
};

export type WaveSetJson = {
  id: string;
  name?: string;
  waves: WaveDef[];
};

export type TowerTypeJson = {
  id: string;
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  sprite: SpriteDefJson;
};

export type TowersJson = {
  types: TowerTypeJson[];
};

async function readJson<T>(relativeFile: string): Promise<T> {
  const fullPath = path.join(process.cwd(), relativeFile);
  const raw = await fs.readFile(fullPath, "utf8");
  return JSON.parse(raw) as T;
}

export default async function Page() {
  const map = await readJson<MapJson>("src/app/tower-defense/maps/level1.json");
  const enemies = await readJson<EnemiesJson>("src/app/tower-defense/enemies/enemies.json");
  const waveSet = await readJson<WaveSetJson>(`src/app/tower-defense/waves/${map.waveSetId}.json`);
  const towers = await readJson<TowersJson>("src/app/tower-defense/towers/towers.json");

  return <TowerDefenseClient map={map} enemies={enemies} waveSet={waveSet} towers={towers} />;
}
