"use client";
import { useEffect, useRef, useCallback, useState } from 'react';
import { Play, Pause, Settings, Save } from 'lucide-react';

export default function TowerDefense() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, containerWidth, containerHeight);
      
      const cols = 30;
      const rows = 20;
      const tileSize = Math.min(containerWidth / cols, containerHeight / rows);
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileSize, 0);
        ctx.lineTo(x * tileSize, rows * tileSize);
        ctx.stroke();
      }
      
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileSize);
        ctx.lineTo(cols * tileSize, y * tileSize);
        ctx.stroke();
      }
      

    }
  }, []);

  const gameLoop = useCallback(() => requestAnimationFrame(gameLoop), []);

  useEffect(() => {
    resizeCanvas();
    gameLoop();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas, gameLoop]);

  return (
    <main className="w-screen h-screen bg-gray-900 flex items-stretch overflow-hidden">
      <section 
        ref={containerRef}
        className="flex-1 bg-black border-8 border-emerald-500 flex items-center justify-center overflow-hidden"
      >
        <canvas ref={canvasRef} className="cursor-crosshair" />
      </section>

      <aside className="w-72 bg-gray-950 border-8 border-emerald-500 flex flex-col gap-3 text-white p-4 overflow-y-auto overflow-x-hidden">
        <div className="border-b-2 border-emerald-500 pb-2 mb-2">
          <h1 className="font-mono text-xl font-bold text-emerald-400">TOWER DEFENSE</h1>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="border-2 border-emerald-600 bg-gray-900 p-2 text-center">
            <div className="font-bold text-yellow-400 text-lg">$420</div>
            <div className="text-xs text-gray-400">Argent</div>
          </div>
          <div className="border-2 border-emerald-600 bg-gray-900 p-2 text-center">
            <div className="font-bold text-blue-400 text-lg">Wave 1</div>
            <div className="text-xs text-gray-400">Vague</div>
          </div>
          <div className="border-2 border-emerald-600 bg-gray-900 p-2 text-center">
            <div className="font-bold text-red-400 text-lg">20</div>
            <div className="text-xs text-gray-400">Vies</div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0">
          <div className="border-b-2 border-emerald-600 pb-2 mb-3">
            <h3 className="font-mono text-sm font-bold text-emerald-400">TOURS DISPONIBLES</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 overflow-y-auto">
            {[
              { name: 'miaou basic', cost: 50, color: 'bg-blue-500' },
            ].map(tower => (
              <button 
                key={tower.name} 
                className="border-2 border-emerald-600 bg-gray-900 p-3 rounded hover:bg-gray-800 hover:border-emerald-400 active:bg-gray-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${tower.color} rounded flex-shrink-0`}></div>
                  <div className="text-left flex-1">
                    <div className="font-mono text-sm font-bold">{tower.name}</div>
                    <div className="text-yellow-400 font-bold text-lg">${tower.cost}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="border-t-2 border-emerald-600 pt-3 mt-auto space-y-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className={`w-full p-4 border-2 font-mono font-bold flex items-center justify-center gap-2 rounded transition-all ${
              isPlaying 
                ? 'bg-red-900 border-red-600 hover:bg-red-800 text-red-100' 
                : 'bg-emerald-900 border-emerald-600 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
            {isPlaying ? 'PAUSE' : 'DÉMARRER'}
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="p-3 border-2 border-emerald-600 bg-gray-900 hover:bg-gray-800 rounded flex flex-col items-center transition-colors">
              <Settings className="w-5 h-5 mb-1"/>
              <span className="text-xs">Paramètres</span>
            </button>
            <button className="p-3 border-2 border-emerald-600 bg-gray-900 hover:bg-gray-800 rounded flex flex-col items-center transition-colors">
              <Save className="w-5 h-5 mb-1"/>
              <span className="text-xs">Sauvegarder</span>
            </button>
          </div>
        </div>
      </aside>
    </main>
  );
}