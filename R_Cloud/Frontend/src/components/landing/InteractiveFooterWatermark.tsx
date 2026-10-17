import React, { useEffect, useRef } from 'react';

interface Point {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Edge {
  p1: number;
  p2: number;
}

export default function InteractiveFooterWatermark() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pointsRef = useRef<Point[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const buildMesh = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width) || 1200;
      const height = Math.floor(rect.height) || 320;

      canvas.width = width;
      canvas.height = height;

      // Offscreen canvas for sampling glyph mask
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      // Characters to distribute edge-to-edge across the entire screen width
      const chars = ['R', '_', 'C', 'L', 'O', 'U', 'D'];

      // Edge-to-edge target span: starts at 2% width, ends at 98% width (no left-right gap!)
      const startX = width * 0.025;
      const endX = width * 0.975;
      const targetWidth = endX - startX;

      // Determine initial font size based on height
      let fontSize = Math.floor(height * 0.76);
      offCtx.font = `900 ${fontSize}px "Manrope", "Inter", -apple-system, sans-serif`;

      let charWidths = chars.map((ch) => offCtx.measureText(ch).width);
      let totalCharW = charWidths.reduce((a, b) => a + b, 0);

      // If text exceeds width, scale font size down proportionally
      if (totalCharW > targetWidth) {
        const scale = targetWidth / totalCharW;
        fontSize = Math.floor(fontSize * scale);
        offCtx.font = `900 ${fontSize}px "Manrope", "Inter", -apple-system, sans-serif`;
        charWidths = chars.map((ch) => offCtx.measureText(ch).width);
        totalCharW = charWidths.reduce((a, b) => a + b, 0);
      }

      // Exact spacing between characters to span edge-to-edge
      const spacing = (targetWidth - totalCharW) / (chars.length - 1);

      // Render distributed characters on offscreen canvas
      let currentX = startX;
      offCtx.textAlign = 'left';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';

      for (let i = 0; i < chars.length; i++) {
        offCtx.fillText(chars[i], currentX, height / 2 + fontSize * 0.03);
        currentX += charWidths[i] + spacing;
      }

      const imgData = offCtx.getImageData(0, 0, width, height).data;

      // Adaptive grid spacing
      const step = Math.max(9, Math.min(14, Math.floor(fontSize * 0.075)));
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);

      const newPoints: Point[] = [];
      const grid: (number | null)[][] = [];

      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
          const px = c * step + step / 2;
          const py = r * step + step / 2;
          const pixelIdx = (Math.floor(py) * width + Math.floor(px)) * 4;

          // If pixel falls on letterform
          if (imgData[pixelIdx + 3] > 120) {
            const idx = newPoints.length;
            newPoints.push({
              originX: px,
              originY: py,
              x: px,
              y: py,
              vx: 0,
              vy: 0,
            });
            grid[r][c] = idx;
          } else {
            grid[r][c] = null;
          }
        }
      }

      // Connect neighbor points to create geometric polygon shapes
      const newEdges: Edge[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = grid[r][c];
          if (idx === null || idx === undefined) continue;

          // Horizontal edge
          if (c + 1 < cols && grid[r][c + 1] !== null && grid[r][c + 1] !== undefined) {
            newEdges.push({ p1: idx, p2: grid[r][c + 1]! });
          }
          // Vertical edge
          if (r + 1 < rows && grid[r + 1][c] !== null && grid[r + 1][c] !== undefined) {
            newEdges.push({ p1: idx, p2: grid[r + 1][c]! });
          }
          // Diagonal triangle facet edge
          if (
            r + 1 < rows &&
            c + 1 < cols &&
            grid[r + 1][c + 1] !== null &&
            grid[r + 1][c + 1] !== undefined
          ) {
            newEdges.push({ p1: idx, p2: grid[r + 1][c + 1]! });
          }
        }
      }

      pointsRef.current = newPoints;
      edgesRef.current = newEdges;
    };

    buildMesh();

    const handleResize = () => {
      buildMesh();
    };

    window.addEventListener('resize', handleResize);

    // Render & Physics Loop
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const points = pointsRef.current;
      const edges = edgesRef.current;
      const mouse = mouseRef.current;

      // Local mouse influence radius (ultra-pinpoint: only immediate line under cursor moves)
      const influenceRadius = 24;
      const radiusSq = influenceRadius * influenceRadius;

      // Physics update: Only points within tight mouse proximity are disturbed
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dsq = dx * dx + dy * dy;

          if (dsq < radiusSq && dsq > 0.01) {
            const dist = Math.sqrt(dsq);
            const force = (1 - dist / influenceRadius) * 10; // Repulsion push
            const angle = Math.atan2(dy, dx);

            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }
        }

        // Spring return force back to rest origin
        const homeDx = p.originX - p.x;
        const homeDy = p.originY - p.y;

        p.vx += homeDx * 0.12;
        p.vy += homeDy * 0.12;

        // Friction damping
        p.vx *= 0.80;
        p.vy *= 0.80;

        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw Wireframe Mesh Edges
      ctx.lineWidth = 1.4;

      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const p1 = points[edge.p1];
        const p2 = points[edge.p2];

        if (!p1 || !p2) continue;

        // Check if edge is currently disturbed by mouse
        const isDisplaced =
          Math.abs(p1.x - p1.originX) > 0.4 ||
          Math.abs(p1.y - p1.originY) > 0.4 ||
          Math.abs(p2.x - p2.originX) > 0.4 ||
          Math.abs(p2.y - p2.originY) > 0.4;

        if (isDisplaced) {
          // Energetic glowing emerald on actively moving section
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.95)';
          ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';
          ctx.shadowBlur = 6;
          ctx.lineWidth = 2.0;
        } else {
          // Serene deep emerald watermark resting tone
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1.3;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Draw Shape Vertices
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const isDisplaced =
          Math.abs(p.x - p.originX) > 0.4 || Math.abs(p.y - p.originY) > 0.4;

        if (isDisplaced) {
          // Active bright node where mouse hovered
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.0, 0, Math.PI * 2);
          ctx.fillStyle = '#6ee7b7';
          ctx.shadowColor = 'rgba(110, 231, 183, 0.8)';
          ctx.shadowBlur = 6;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else {
          // Subtle rest node
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Track cursor relative to canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = {
      x: -9999,
      y: -9999,
      active: false,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[240px] sm:h-[300px] lg:h-[360px] xl:h-[400px] overflow-hidden select-none mt-10 flex items-center justify-center cursor-default"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full block cursor-default"
      />
    </div>
  );
}
