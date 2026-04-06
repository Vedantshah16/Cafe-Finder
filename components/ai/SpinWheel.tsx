'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, ExternalLink, Dices } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/store/useAppStore';
import { WHEEL_COLORS, truncate } from '@/lib/utils/helpers';
import type { Cafe } from '@/types';

interface SpinWheelProps {
  cafes: Cafe[];
}

export default function SpinWheel({ cafes }: SpinWheelProps) {
  const { isSpinWheelOpen, toggleSpinWheel } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Cafe | null>(null);
  const [rotation, setRotation] = useState(0);
  const animFrameRef = useRef<number>(0);
  const currentRotRef = useRef(0);

  const items = cafes.slice(0, 8);
  const segmentAngle = (2 * Math.PI) / items.length;

  const drawWheel = useCallback(
    (rot: number) => {
      const canvas = canvasRef.current;
      if (!canvas || items.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = cx - 8;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Outer ring glow
      const gradient = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, 'rgba(212, 168, 83, 0.1)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      items.forEach((item, i) => {
        const startAngle = rot + i * segmentAngle - Math.PI / 2;
        const endAngle = startAngle + segmentAngle;
        const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color + '22'; // transparent fill
        ctx.fill();
        ctx.strokeStyle = color + '66';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw text
        const textAngle = startAngle + segmentAngle / 2;
        const textRadius = radius * 0.62;
        const tx = cx + Math.cos(textAngle) * textRadius;
        const ty = cy + Math.sin(textAngle) * textRadius;

        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(truncate(item.name, 14), 0, 0);
        ctx.restore();

        // Colored dot on outer edge
        const dotAngle = startAngle + segmentAngle / 2;
        const dotX = cx + Math.cos(dotAngle) * (radius - 10);
        const dotY = cy + Math.sin(dotAngle) * (radius - 10);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Center circle
      const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      centerGrad.addColorStop(0, '#2E2E2E');
      centerGrad.addColorStop(1, '#1A1A1A');
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
      ctx.fillStyle = centerGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 168, 83, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center icon
      ctx.fillStyle = '#D4A853';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☕', cx, cy);
    },
    [items, segmentAngle]
  );

  useEffect(() => {
    drawWheel(currentRotRef.current);
  }, [drawWheel, isSpinWheelOpen]);

  const spin = useCallback(() => {
    if (spinning || items.length === 0) return;
    setSpinning(true);
    setWinner(null);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const finalAngle = currentRotRef.current + extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const duration = 4000 + Math.random() * 2000;
    const startTime = performance.now();
    const startRot = currentRotRef.current;

    function easeOut(t: number): number {
      return 1 - Math.pow(1 - t, 4);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const currentAngle = startRot + (finalAngle - startRot) * easedProgress;

      currentRotRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);

        // Determine winner
        const normalizedAngle = ((2 * Math.PI - (currentAngle % (2 * Math.PI))) + Math.PI / 2) % (2 * Math.PI);
        const winnerIndex = Math.floor(normalizedAngle / segmentAngle) % items.length;
        const winnerCafe = items[winnerIndex];
        setWinner(winnerCafe);

        // Confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5, x: 0.5 },
          colors: ['#D4A853', '#E8C070', '#fff', '#FF8C42', '#5B8AF0'],
        });
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [spinning, items, segmentAngle, drawWheel]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <AnimatePresence>
      {isSpinWheelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={toggleSpinWheel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-glass-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <Dices size={20} className="text-accent" />
                  Spin the Wheel
                </h2>
                <p className="text-text-muted text-sm mt-0.5">Can't decide? Let fate choose!</p>
              </div>
              <button
                onClick={toggleSpinWheel}
                className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <p>Search for cafes first to spin the wheel!</p>
              </div>
            ) : (
              <>
                {/* Wheel container */}
                <div className="relative flex items-center justify-center mb-5">
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 -translate-y-1">
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '20px solid #D4A853',
                        filter: 'drop-shadow(0 2px 4px rgba(212,168,83,0.5))',
                      }}
                    />
                  </div>

                  {/* Canvas */}
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="rounded-full"
                    style={{
                      filter: spinning
                        ? 'drop-shadow(0 0 20px rgba(212,168,83,0.4))'
                        : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                      transition: 'filter 0.3s ease',
                    }}
                  />
                </div>

                {/* Winner announcement */}
                <AnimatePresence mode="wait">
                  {winner && (
                    <motion.div
                      key={winner.place_id}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, type: 'spring' }}
                      className="mb-4 p-4 bg-accent-light border border-accent/30 rounded-2xl"
                    >
                      <p className="text-accent text-sm font-medium mb-1 flex items-center gap-1">
                        🎉 The wheel has spoken!
                      </p>
                      <h3 className="text-lg font-bold text-text-primary mb-1">{winner.name}</h3>
                      <p className="text-text-muted text-xs mb-3 line-clamp-1">{winner.address}</p>
                      <div className="flex gap-2">
                        <Link
                          href={`/cafe/${winner.place_id}`}
                          onClick={toggleSpinWheel}
                          className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black text-sm font-semibold py-2.5 rounded-xl transition-colors"
                        >
                          <ExternalLink size={14} />
                          View Cafe
                        </Link>
                        <button
                          onClick={() => setWinner(null)}
                          className="px-4 py-2.5 bg-surface-elevated hover:bg-surface-hover text-text-secondary text-sm rounded-xl transition-colors border border-border"
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Spin button */}
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={spin}
                    disabled={spinning}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-semibold py-3.5 rounded-2xl transition-all disabled:opacity-60 shadow-accent"
                  >
                    {spinning ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                        >
                          <Dices size={18} />
                        </motion.div>
                        Spinning…
                      </>
                    ) : (
                      <>
                        <Dices size={18} />
                        Spin the Wheel!
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={() => { setWinner(null); drawWheel(0); currentRotRef.current = 0; }}
                    className="p-3.5 rounded-2xl bg-surface-elevated hover:bg-surface-hover border border-border transition-colors text-text-muted"
                    title="Reset"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>

                {/* Cafe list */}
                <div className="mt-4">
                  <p className="text-xs text-text-muted mb-2">
                    {items.length} cafes in the wheel
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((cafe, i) => (
                      <span
                        key={cafe.place_id}
                        className="text-xs px-2.5 py-1 rounded-full border border-border text-text-secondary"
                        style={{ borderColor: WHEEL_COLORS[i % WHEEL_COLORS.length] + '40' }}
                      >
                        {truncate(cafe.name, 18)}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
