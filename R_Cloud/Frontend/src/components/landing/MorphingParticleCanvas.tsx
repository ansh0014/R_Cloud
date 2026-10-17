import { useEffect, useRef, useCallback } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  size: number;
}

interface Edge {
  p1: number;
  p2: number;
}

export type ShapeMode = 'cube' | 'sphere' | 'helix' | 'torus' | 'wave' | 'rectangle';

interface MorphingParticleCanvasProps {
  currentStep: number;
  lightProgress?: number; // 0 = dark hero, 1 = white space (story)
}

export default function MorphingParticleCanvas({ currentStep, lightProgress }: MorphingParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pointsRef = useRef<Point3D[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const shapeModeRef = useRef<ShapeMode>('cube');
  const rotYRef = useRef<number>(0);
  const rotXRef = useRef<number>(0.25);
  const lightProgressTargetRef = useRef<number>(0);
  const currentLightProgressRef = useRef<number>(0);

  useEffect(() => {
    lightProgressTargetRef.current = lightProgress ?? (currentStep >= 0 ? 1 : 0);
  }, [lightProgress, currentStep]);

  // Generate target shapes with 1:1 isometric proportions
  const generateShape = useCallback((shape: ShapeMode) => {
    const points: Point3D[] = [];
    const edges: Edge[] = [];

    if (shape === 'cube') {
      // 3D Partitioned Dashed Wireframe Cube
      const S = 125; // 250px cube
      const divisions = 3;
      const stepVal = (S * 2) / divisions;

      const pointMap = new Map<string, number>();

      const getPointIdx = (x: number, y: number, z: number) => {
        const key = `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
        if (pointMap.has(key)) return pointMap.get(key)!;
        const idx = points.length;
        points.push({
          x: 0,
          y: 0,
          z: 0,
          targetX: x,
          targetY: y,
          targetZ: z,
          size: 2.4,
        });
        pointMap.set(key, idx);
        return idx;
      };

      for (let i = 0; i <= divisions; i++) {
        const u = -S + i * stepVal;
        for (let j = 0; j <= divisions; j++) {
          const v = -S + j * stepVal;

          const pX1 = getPointIdx(-S, u, v);
          const pX2 = getPointIdx(S, u, v);
          edges.push({ p1: pX1, p2: pX2 });

          const pY1 = getPointIdx(u, -S, v);
          const pY2 = getPointIdx(u, S, v);
          edges.push({ p1: pY1, p2: pY2 });

          const pZ1 = getPointIdx(u, v, -S);
          const pZ2 = getPointIdx(u, v, S);
          edges.push({ p1: pZ1, p2: pZ2 });
        }
      }
    } else if (shape === 'sphere') {
      // 3D Geodesic Sphere
      const latCount = 6;
      const lonCount = 12;
      const radius = 145;

      for (let i = 0; i < latCount; i++) {
        const phi = (Math.PI * (i + 1)) / (latCount + 1);
        const y = Math.cos(phi) * radius;
        const ringRadius = Math.sin(phi) * radius;
        const startIdx = points.length;

        for (let j = 0; j < lonCount; j++) {
          const theta = (Math.PI * 2 * j) / lonCount;
          const x = Math.cos(theta) * ringRadius;
          const z = Math.sin(theta) * ringRadius;

          const idx = points.length;
          points.push({
            x: 0,
            y: 0,
            z: 0,
            targetX: x,
            targetY: y,
            targetZ: z,
            size: 2.4,
          });

          const nextIdx = startIdx + ((j + 1) % lonCount);
          edges.push({ p1: idx, p2: nextIdx });

          if (i > 0) {
            edges.push({ p1: idx, p2: idx - lonCount });
          }
        }
      }
    } else if (shape === 'helix') {
      // 3D Double Helix (as shown in user's paint screenshot!)
      const numSteps = 32;
      const radius = 110;
      const heightTotal = 320;

      for (let s = 0; s < 2; s++) {
        const offset = s * Math.PI;

        for (let i = 0; i < numSteps; i++) {
          const progress = i / numSteps;
          const theta = progress * Math.PI * 4 + offset;
          const y = (progress - 0.5) * heightTotal;
          const x = Math.cos(theta) * radius;
          const z = Math.sin(theta) * radius;

          const idx = points.length;
          points.push({
            x: 0,
            y: 0,
            z: 0,
            targetX: x,
            targetY: y,
            targetZ: z,
            size: 2.4,
          });

          if (i > 0) {
            edges.push({ p1: idx, p2: idx - 1 });
          }

          if (s === 1 && i % 3 === 0) {
            const oppositeIdx = idx - numSteps;
            if (oppositeIdx >= 0) {
              edges.push({ p1: idx, p2: oppositeIdx });
            }
          }
        }
      }
    } else if (shape === 'torus') {
      // 3D Continuous Telemetry Torus Ring (Step 04)
      const majorR = 135;
      const minorR = 45;
      const majorSteps = 16;
      const minorSteps = 8;

      for (let i = 0; i < majorSteps; i++) {
        const u = (Math.PI * 2 * i) / majorSteps;
        const ringStart = points.length;

        for (let j = 0; j < minorSteps; j++) {
          const v = (Math.PI * 2 * j) / minorSteps;
          const rad = majorR + minorR * Math.cos(v);
          const x = rad * Math.cos(u);
          const y = minorR * Math.sin(v) * 1.2; // vertical thickness
          const z = rad * Math.sin(u); // 3D depth ring

          const idx = points.length;
          points.push({
            x: 0,
            y: 0,
            z: 0,
            targetX: x,
            targetY: y,
            targetZ: z,
            size: 2.4,
          });

          // Connect ring loop
          edges.push({ p1: idx, p2: ringStart + ((j + 1) % minorSteps) });

          // Connect to previous ring
          if (i > 0) {
            edges.push({ p1: idx, p2: idx - minorSteps });
          } else if (i === majorSteps - 1) {
            edges.push({ p1: idx, p2: j });
          }
        }
      }
    } else if (shape === 'wave') {
      // 3D Undulating Telemetry Waveform
      const rows = 8;
      const cols = 8;
      const spacing = 32;
      const offsetX = (cols - 1) * spacing * 0.5;
      const offsetZ = (rows - 1) * spacing * 0.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing - offsetX;
          const z = r * spacing - offsetZ;
          const dist = Math.sqrt(x * x + z * z);
          const y = Math.sin(dist * 0.05) * 40;

          const idx = points.length;
          points.push({
            x: 0,
            y: 0,
            z: 0,
            targetX: x,
            targetY: y,
            targetZ: z,
            size: 2.4,
          });

          if (c > 0) edges.push({ p1: idx, p2: idx - 1 });
          if (r > 0) edges.push({ p1: idx, p2: idx - cols });
        }
      }
    } else if (shape === 'rectangle') {
      // Perimeter Border Rectangle - Snaps to the outer border of the Bento Box
      const totalPoints = 64;
      for (let i = 0; i < totalPoints; i++) {
        points.push({
          x: 0,
          y: 0,
          z: 0,
          targetX: 0,
          targetY: 0,
          targetZ: 0,
          size: 2.8,
        });
        // Connect each point to next point in a continuous closed perimeter edge
        edges.push({
          p1: i,
          p2: (i + 1) % totalPoints,
        });
      }
    }

    return { points, edges };
  }, []);

  // Direct morph from current positions to new targets without collapsing
  const triggerDirectMorph = useCallback(
    (targetShape: ShapeMode) => {
      shapeModeRef.current = targetShape;

      const { points: newPoints, edges: newEdges } = generateShape(targetShape);
      const currentPoints = pointsRef.current;
      const resultPoints: Point3D[] = [];

      for (let i = 0; i < newPoints.length; i++) {
        if (i < currentPoints.length) {
          resultPoints.push({
            x: currentPoints[i].x,
            y: currentPoints[i].y,
            z: currentPoints[i].z,
            targetX: newPoints[i].targetX,
            targetY: newPoints[i].targetY,
            targetZ: newPoints[i].targetZ,
            size: newPoints[i].size,
          });
        } else {
          const refPt = currentPoints[i % currentPoints.length] || newPoints[i];
          resultPoints.push({
            x: refPt.x,
            y: refPt.y,
            z: refPt.z,
            targetX: newPoints[i].targetX,
            targetY: newPoints[i].targetY,
            targetZ: newPoints[i].targetZ,
            size: newPoints[i].size,
          });
        }
      }

      pointsRef.current = resultPoints;
      edgesRef.current = newEdges;
    },
    [generateShape]
  );

  // Sync with scroll step based on step narrative context
  useEffect(() => {
    let newShape: ShapeMode = 'cube';
    if (currentStep === -1) {
      newShape = 'cube'; // Hero: Partitioned Architecture Cube
    } else if (currentStep === 0) {
      newShape = 'sphere'; // Step 01: Knowledge Graph Relational Sphere
    } else if (currentStep === 1) {
      newShape = 'helix'; // Step 02: Multi-Agent Swarm Double Helix
    } else if (currentStep === 2) {
      newShape = 'wave'; // Step 03: Distributed Cloud Runtime Grid Wave
    } else if (currentStep === 3) {
      newShape = 'torus'; // Step 04: Continuous Telemetry Observability Torus
    } else if (currentStep >= 4) {
      newShape = 'rectangle'; // Bento Features: 3D Partitioned Rectangle!
    }

    if (newShape !== shapeModeRef.current) {
      triggerDirectMorph(newShape);
    }
  }, [currentStep, triggerDirectMorph]);

  // Initial setup
  useEffect(() => {
    const initial = generateShape('cube');
    pointsRef.current = initial.points.map((p) => ({
      ...p,
      x: p.targetX,
      y: p.targetY,
      z: p.targetZ,
    }));
    edgesRef.current = initial.edges;
  }, [generateShape]);

  // Main 3D Render Loop with dynamic automatic size adjustment
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Dynamically auto-adjust canvas dimensions to parent element
      const pWidth = canvas.parentElement?.clientWidth || 420;
      const pHeight = canvas.parentElement?.clientHeight || 420;

      if (canvas.width !== pWidth || canvas.height !== pHeight) {
        canvas.width = pWidth;
        canvas.height = pHeight;
      }

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const isRectangle = shapeModeRef.current === 'rectangle';

      if (isRectangle) {
        // Shape does NOT rotate inside Bento ("shape isme move nahi karega")
        rotYRef.current += (0 - rotYRef.current) * 0.15;
        rotXRef.current += (0 - rotXRef.current) * 0.15;

        // Points snap directly onto the outer rectangular border ("border pe chala jayega")
        const pad = 2; // Tightly hug the card's exact border
        const halfW = width * 0.5 - pad;
        const halfH = height * 0.5 - pad;
        const cornerR = Math.min(16, halfW * 0.15, halfH * 0.15);
        const total = pointsRef.current.length;

        // Perimeter segment lengths for smooth rounded rectangle traversal
        const straightW = (halfW - cornerR) * 2;
        const straightH = (halfH - cornerR) * 2;
        const cornerArc = Math.PI * 0.5 * cornerR;
        const perimeter = 2 * straightW + 2 * straightH + 4 * cornerArc;

        for (let i = 0; i < total; i++) {
          let dist = (i / total) * perimeter;
          let tx = 0;
          let ty = 0;

          if (dist < straightW) {
            // Top edge (left to right)
            tx = -halfW + cornerR + dist;
            ty = -halfH;
          } else if ((dist -= straightW) < cornerArc) {
            // Top-right corner
            const ang = -Math.PI * 0.5 + (dist / cornerArc) * (Math.PI * 0.5);
            tx = halfW - cornerR + Math.cos(ang) * cornerR;
            ty = -halfH + cornerR + Math.sin(ang) * cornerR;
          } else if ((dist -= cornerArc) < straightH) {
            // Right edge (top to bottom)
            tx = halfW;
            ty = -halfH + cornerR + dist;
          } else if ((dist -= straightH) < cornerArc) {
            // Bottom-right corner
            const ang = (dist / cornerArc) * (Math.PI * 0.5);
            tx = halfW - cornerR + Math.cos(ang) * cornerR;
            ty = halfH - cornerR + Math.sin(ang) * cornerR;
          } else if ((dist -= cornerArc) < straightW) {
            // Bottom edge (right to left)
            tx = halfW - cornerR - dist;
            ty = halfH;
          } else if ((dist -= straightW) < cornerArc) {
            // Bottom-left corner
            const ang = Math.PI * 0.5 + (dist / cornerArc) * (Math.PI * 0.5);
            tx = -halfW + cornerR + Math.cos(ang) * cornerR;
            ty = halfH - cornerR + Math.sin(ang) * cornerR;
          } else if ((dist -= cornerArc) < straightH) {
            // Left edge (bottom to top)
            tx = -halfW;
            ty = halfH - cornerR - dist;
          } else {
            // Top-left corner
            dist -= straightH;
            const ang = Math.PI + (dist / cornerArc) * (Math.PI * 0.5);
            tx = -halfW + cornerR + Math.cos(ang) * cornerR;
            ty = -halfH + cornerR + Math.sin(ang) * cornerR;
          }

          pointsRef.current[i].targetX = tx;
          pointsRef.current[i].targetY = ty;
          pointsRef.current[i].targetZ = 0;
        }
      } else {
        // Continuous 3D rotation in Hero and Story
        rotYRef.current += 0.014;
        rotXRef.current += 0.007;
      }

      const cosY = Math.cos(rotYRef.current);
      const sinY = Math.sin(rotYRef.current);
      const cosX = Math.cos(rotXRef.current);
      const sinX = Math.sin(rotXRef.current);

      const points = pointsRef.current;
      const edges = edgesRef.current;

      // Smooth point interpolation
      const lerpSpeed = 0.08;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += (p.targetX - p.x) * lerpSpeed;
        p.y += (p.targetY - p.y) * lerpSpeed;
        p.z += (p.targetZ - p.z) * lerpSpeed;
      }

      // Dynamic scale factor based on container dimensions
      const minDimension = Math.min(width, height);
      const autoScaleFactor = Math.max(0.85, Math.min(1.5, minDimension / 360));

      const fov = 440;
      const projected: { x: number; y: number; z: number; scale: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        if (isRectangle) {
          // Direct 2D border alignment with exact container dimensions
          projected.push({
            x: width / 2 + p.x,
            y: height / 2 + p.y,
            z: 0,
            scale: 1,
          });
        } else {
          // 3D perspective projection for Hero & Story
          const sx = p.x * autoScaleFactor;
          const sy = p.y * autoScaleFactor;
          const sz = p.z * autoScaleFactor;

          // Rotate Y
          const x1 = sx * cosY - sz * sinY;
          const z1 = sz * cosY + sx * sinY;

          // Rotate X
          const y1 = sy * cosX - z1 * sinX;
          const z2 = z1 * cosX + sy * sinX;

          const scale = fov / (fov + z2 + 130);
          const projX = width / 2 + x1 * scale;
          const projY = height / 2 + y1 * scale;

          projected.push({ x: projX, y: projY, z: z2, scale });
        }
      }

      // Smoothly interpolate light progress (0 = dark hero, 1 = white space)
      currentLightProgressRef.current +=
        (lightProgressTargetRef.current - currentLightProgressRef.current) * 0.12;
      const lp = currentLightProgressRef.current;

      // Color interpolation: White (255, 255, 255) -> Jet Black (15, 23, 42)
      const edgeR = Math.round(255 * (1 - lp) + 15 * lp);
      const edgeG = Math.round(255 * (1 - lp) + 23 * lp);
      const edgeB = Math.round(255 * (1 - lp) + 42 * lp);

      // Draw dashed wireframe edges
      if (isRectangle) {
        // High-tech crisp Jet Black perimeter border line
        ctx.setLineDash([8, 5]);
        ctx.lineWidth = 2.4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 4;
        ctx.strokeStyle = '#0f172a';
      } else {
        ctx.setLineDash([7, 4]);
        ctx.lineWidth = 2.2;
        if (lp < 0.5) {
          ctx.shadowColor = `rgba(52, 211, 153, ${(1 - lp * 2) * 0.6})`;
          ctx.shadowBlur = Math.round(8 * (1 - lp * 2));
        } else {
          ctx.shadowColor = `rgba(0, 0, 0, ${(lp - 0.5) * 0.2})`;
          ctx.shadowBlur = 1;
        }
      }

      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const p1 = projected[edge.p1];
        const p2 = projected[edge.p2];

        if (!p1 || !p2) continue;

        if (!isRectangle) {
          const depth = (p1.z + p2.z) * 0.5;
          const alpha = Math.max(0.2, Math.min(1, (depth + 200) / 400));
          ctx.strokeStyle = `rgba(${edgeR}, ${edgeG}, ${edgeB}, ${alpha * (lp > 0.5 ? 0.95 : 0.95)})`;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw vertices
      ctx.setLineDash([]);
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        if (isRectangle) {
          // Sharp Jet Black perimeter border node with white inner core
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else {
          const alpha = Math.max(0.3, Math.min(1, (p.z + 200) / 400));

          if (lp < 0.5) {
            // Dark Mode (Hero): Neon Emerald Outer Aura + Pure White Core
            const glowAlpha = 1 - lp * 2;
            ctx.shadowColor = `rgba(110, 231, 183, ${glowAlpha * 0.9})`;
            ctx.shadowBlur = 10 * glowAlpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5 * p.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.55 * glowAlpha})`;
            ctx.fill();

            ctx.shadowBlur = 4 * glowAlpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
          } else {
            // White Space Mode: Crisp Jet Black Nodes
            const darkFactor = (lp - 0.5) * 2;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            ctx.shadowBlur = 1;

            // Outer halo
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4.5 * p.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(15, 23, 42, ${alpha * 0.18 * darkFactor})`;
            ctx.fill();

            // Solid Jet Black Core
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.8 * p.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(10, 10, 10, ${alpha * 0.95})`;
            ctx.fill();
          }
        }
      }
      ctx.shadowBlur = 0;


      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none cursor-pointer transition-transform duration-500 ease-out hover:scale-[1.07] active:scale-95 group"
      title="3D Autonomous Agent Architecture"
    >
      <div
        className="absolute w-[280px] h-[280px] rounded-full bg-emerald-400/20 blur-3xl pointer-events-none group-hover:scale-110 transition-opacity duration-500"
        style={{
          opacity: Math.max(0, 1 - (lightProgress ?? (currentStep >= 0 ? 1 : 0))),
        }}
      />

      <canvas
        ref={canvasRef}
        className="relative z-10 w-full h-full pointer-events-auto"
      />
    </div>
  );
}
