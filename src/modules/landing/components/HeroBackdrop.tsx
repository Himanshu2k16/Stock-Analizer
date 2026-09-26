"use client";

import { useEffect, useRef } from "react";

type Candle = { o: number; c: number; h: number; l: number };
type Particle = { x: number; y: number; r: number; speed: number; phase: number };

/**
 * Layered hero canvas: scrolling candlestick series, three drifting sine waves,
 * rising glow particles and a slowly sliding grid — all in one render loop.
 */
export function HeroBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const ctx = context;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;

    const spacing = 24;
    const bodyW = 12;
    const count = 160;
    let candles: Candle[] = [];
    let particles: Particle[] = [];
    let value = 50;

    const nextCandle = (): Candle => {
      const drift = (Math.random() - 0.42) * 10;
      const o = value;
      const c = Math.max(6, Math.min(94, o + drift));
      const h = Math.min(98, Math.max(o, c) + Math.random() * 6);
      const l = Math.max(2, Math.min(o, c) - Math.random() * 6);
      value = c;
      return { o, c, h, l };
    };

    const reset = () => {
      value = 50;
      candles = Array.from({ length: count }, nextCandle);
      particles = Array.from({ length: 42 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.8 + Math.random() * 1.8,
        speed: 0.08 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * DPR);
      canvas.height = Math.round(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    reset();
    const onResize = () => {
      resize();
      reset();
    };
    window.addEventListener("resize", onResize);

    let offset = 0;
    let gridOffset = 0;
    let time = 0;
    let last = performance.now();

    const waves = [
      { amp: 16, len: 0.011, speed: 0.55, yBase: 0.72, color: "64, 120, 255", alpha: 0.22, width: 1.4 },
      { amp: 22, len: 0.007, speed: -0.38, yBase: 0.82, color: "64, 120, 255", alpha: 0.14, width: 1.2 },
      { amp: 12, len: 0.015, speed: 0.8, yBase: 0.9, color: "56, 210, 130", alpha: 0.12, width: 1.2 },
    ];

    const frame = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      time += dt;
      offset += dt * 0.02;
      gridOffset = (gridOffset + dt * 0.006) % 64;
      while (offset >= spacing) {
        offset -= spacing;
        candles.push(nextCandle());
        candles.shift();
      }

      ctx.clearRect(0, 0, width, height);

      // sliding grid
      ctx.strokeStyle = "rgba(255,255,255,0.028)";
      ctx.lineWidth = 1;
      for (let x = -gridOffset; x < width; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0.16; y < 1; y += 0.21) {
        ctx.beginPath();
        ctx.moveTo(0, height * y);
        ctx.lineTo(width, height * y);
        ctx.stroke();
      }

      const pad = height * 0.12;
      const usable = height - pad * 2;
      const y = (v: number) => pad + ((100 - v) / 100) * usable;

      // candlestick series
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        const x = i * spacing - offset + spacing / 2;
        if (x < -spacing || x > width + spacing) continue;
        const up = c.c >= c.o;
        const color = up ? "38, 194, 106" : "239, 88, 88";
        ctx.strokeStyle = `rgba(${color}, 0.26)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, y(c.h));
        ctx.lineTo(x, y(c.l));
        ctx.stroke();
        const top = y(Math.max(c.o, c.c));
        const bot = y(Math.min(c.o, c.c));
        ctx.fillStyle = `rgba(${color}, 0.13)`;
        ctx.fillRect(x - bodyW / 2, top, bodyW, Math.max(1.5, bot - top));
      }

      // glowing close line
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const x = i * spacing - offset + spacing / 2;
        const cy = y(candles[i].c);
        if (i === 0) ctx.moveTo(x, cy);
        else ctx.lineTo(x, cy);
      }
      ctx.strokeStyle = "rgba(72, 128, 255, 0.38)";
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "rgba(41, 98, 255, 0.5)";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      // sine waves along the bottom
      for (const w of waves) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const yy =
            height * w.yBase + Math.sin(x * w.len + time * 0.0009 * w.speed + w.yBase * 7) * w.amp + Math.sin(x * w.len * 0.5 + time * 0.0006 * w.speed) * w.amp * 0.4;
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = `rgba(${w.color}, ${w.alpha})`;
        ctx.lineWidth = w.width;
        ctx.stroke();
      }

      // rising particles
      for (const p of particles) {
        p.y -= p.speed * (dt / 16);
        if (p.y < -8) {
          p.y = height + 8;
          p.x = Math.random() * width;
        }
        const twinkle = 0.25 + 0.2 * Math.sin(time * 0.002 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(122, 165, 255, ${twinkle})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* drifting aurora fields */}
      <div className="animate-drift absolute -top-40 left-[-10%] h-[560px] w-[720px] rounded-full bg-[radial-gradient(circle,rgba(41,98,255,0.17),transparent_65%)] blur-3xl" />
      <div className="animate-drift-slow absolute -right-40 top-1/4 h-[520px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(56,210,130,0.09),transparent_65%)] blur-3xl" />

      <canvas ref={ref} className="absolute inset-0 h-full w-full" />

      {/* readability vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,14,20,0.12)_0%,rgba(11,14,20,0.62)_60%,#0b0e14_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-ink-950" />
    </div>
  );
}
