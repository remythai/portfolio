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

export type EnemyTypeJson = {
  id: string;
  hp: number;
  speed: number;
  color: string;
  radiusScale: number;
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

async function readJson<T>(relativePath: string): Promise<T> {
  const filePath = path.join(process.cwd(), relativePath);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export default async function Page() {
  const map = await readJson<MapJson>("src/app/tower-defense/maps/level1.json");
  const enemies = await readJson<EnemiesJson>("src/app/tower-defense/enemies/enemies.json");
  const waveSet = await readJson<WaveSetJson>(`src/app/tower-defense/waves/${map.waveSetId}.json`);

  return <TowerDefenseClient map={map} enemies={enemies} waveSet={waveSet} />;
}
