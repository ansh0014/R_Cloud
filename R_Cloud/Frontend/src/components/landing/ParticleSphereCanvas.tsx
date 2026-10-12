import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  origX: number;
  origY: number;
  origZ: number;
  size: number;
  brightness: number;
}

export default function ParticleSphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const radius = Math.min(width, height) * 0.38;
    const particleCount = 200;
    const particles: Particle[] = [];

    // Fibonacci sphere distribution for uniform 3D sphere point distribution
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      particles.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        origX: x * radius,
        origY: y * radius,
        origZ: z * radius,
        size: Math.random() * 1.8 + 1.2,
        brightness: Math.random() * 0.5 + 0.5,
      });
    }

    let angleX = 0.002;
    let angleY = 0.004;
    let targetAngleX = 0.002;
    let targetAngleY = 0.004;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      targetAngleY = mouseX * 0.02;
      targetAngleX = -mouseY * 0.02;
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation for mouse interaction
      angleX += (targetAngleX - angleX) * 0.05;
      angleY += (targetAngleY - angleY) * 0.05;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Project points
      const projected: { x: number; y: number; z: number; size: number; alpha: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Rotate Y
        let x1 = p.origX * cosY - p.origZ * sinY;
        let z1 = p.origZ * cosY + p.origX * sinY;

        // Rotate X
        let y1 = p.origY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.origY * sinX;

        // Update original to keep continuous slow rotation
        p.origX = x1;
        p.origY = y1;
        p.origZ = z2;

        // 3D perspective projection
        const fov = 400;
        const scale = fov / (fov + z2);
        const projX = width / 2 + x1 * scale;
        const projY = height / 2 + y1 * scale;

        // Alpha based on depth (z-index)
        const depthAlpha = Math.max(0.12, (z2 + radius) / (2 * radius));

        projected.push({
          x: projX,
          y: projY,
          z: z2,
          size: p.size * scale,
          alpha: depthAlpha * p.brightness,
        });
      }

      // Draw connection lines between nearby points
      const maxDist = 48;
      ctx.lineWidth = 0.75;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.3 * Math.min(projected[i].alpha, projected[j].alpha);
            ctx.strokeStyle = `rgba(110, 231, 183, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw glowing particle dots
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        // Glow ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.alpha * 0.25})`;
        ctx.fill();

        // Core bright point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.95})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center pointer-events-none">
      {/* Radial soft emerald backlight */}
      <div className="absolute w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
      <canvas
        ref={canvasRef}
        className="relative z-10 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
