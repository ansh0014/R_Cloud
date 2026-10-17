import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Layers,
  Shield,
  Cpu,
  Zap,
  Activity,
  GitFork,
} from 'lucide-react';

// ── 3D Geometry Definitions ──────────────────────────────────────────────────
interface Point3D {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}

interface Edge {
  p1: number;
  p2: number;
}

interface PulseParticle {
  edgeIdx: number;
  progress: number;
  speed: number;
}

// 6 completely new shapes not used in previous sections:
// 1. Icosahedron (20-faced polyhedral gem)
// 2. Diamond (Double-pyramid octahedron gem)
// 3. Hyperboloid (Hourglass ruled vortex)
// 4. Stellated Star (Merkaba 8-point 3D star)
// 5. HexPrism (Capped hexagonal cryptographic cage)
// 6. Trefoil Knot (3D continuous topological infinity knot)
type ShapeType = 'icosahedron' | 'diamond' | 'hyperboloid' | 'stellated' | 'hexprism' | 'knot';

export default function BentoFeatures() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // 3D Engine State Refs (avoids React re-renders in 60fps loop)
  const pointsRef = useRef<Point3D[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  const rotXRef = useRef<number>(0.2);
  const rotYRef = useRef<number>(0.4);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragVelocityRef = useRef<{ x: number; y: number }>({ x: 0.007, y: 0.0025 });

  // Permanent pipeline data pulse particles traveling along edges
  const pulseParticlesRef = useRef<PulseParticle[]>([]);

  // Build Geometry for 6 Brand-New Archetypes
  const buildGeometry = useCallback((shape: ShapeType) => {
    const points: Point3D[] = [];
    const edges: Edge[] = [];

    if (shape === 'icosahedron') {
      // 1. 3D Icosahedron (20-Faceted Golden Ratio Polyhedron)
      const phi = (1 + Math.sqrt(5)) * 0.5; // ~1.618
      const S = 80;
      const P = phi * S;

      // 12 vertices
      const rawVerts = [
        [-S, P, 0], [S, P, 0], [-S, -P, 0], [S, -P, 0],
        [0, -S, P], [0, S, P], [0, -S, -P], [0, S, -P],
        [P, 0, -S], [P, 0, S], [-P, 0, -S], [-P, 0, S],
      ];

      rawVerts.forEach(([x, y, z]) => {
        points.push({ x: 0, y: 0, z: 0, targetX: x, targetY: y, targetZ: z });
      });

      // 30 outer edges: connect vertices at distance ~ 2*S
      const edgeDistSq = 4 * S * S * 1.05;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = rawVerts[i][0] - rawVerts[j][0];
          const dy = rawVerts[i][1] - rawVerts[j][1];
          const dz = rawVerts[i][2] - rawVerts[j][2];
          const dsq = dx * dx + dy * dy + dz * dz;
          if (Math.abs(dsq - edgeDistSq) < S * S * 0.25) {
            edges.push({ p1: i, p2: j });
          }
        }
      }

      // Add 6 internal core connection spokes
      const centerIdx = points.length;
      points.push({ x: 0, y: 0, z: 0, targetX: 0, targetY: 0, targetZ: 0 });
      for (let i = 0; i < 12; i += 2) {
        edges.push({ p1: i, p2: centerIdx });
      }
    } else if (shape === 'diamond') {
      // 2. 3D Diamond / Double-Apex Octahedron
      const H = 140;
      const R = 110;
      const segments = 8;
      const apexTopIdx = points.length;
      points.push({ x: 0, y: 0, z: 0, targetX: 0, targetY: -H, targetZ: 0 });

      const apexBotIdx = points.length;
      points.push({ x: 0, y: 0, z: 0, targetX: 0, targetY: H, targetZ: 0 });

      const ringStart = points.length;
      for (let i = 0; i < segments; i++) {
        const theta = (Math.PI * 2 * i) / segments;
        const x = Math.cos(theta) * R;
        const z = Math.sin(theta) * R;
        const idx = points.length;
        points.push({ x: 0, y: 0, z: 0, targetX: x, targetY: 0, targetZ: z });

        // Connect ring
        edges.push({ p1: idx, p2: ringStart + ((i + 1) % segments) });
        // Connect to top & bottom apexes
        edges.push({ p1: idx, p2: apexTopIdx });
        edges.push({ p1: idx, p2: apexBotIdx });
      }

      // Mid-level internal brace ring
      const innerR = R * 0.55;
      const innerStart = points.length;
      for (let i = 0; i < segments; i++) {
        const theta = (Math.PI * 2 * i) / segments + Math.PI / segments;
        const x = Math.cos(theta) * innerR;
        const z = Math.sin(theta) * innerR;
        const idx = points.length;
        points.push({ x: 0, y: 0, z: 0, targetX: x, targetY: (i % 2 === 0 ? 30 : -30), targetZ: z });
        edges.push({ p1: idx, p2: innerStart + ((i + 1) % segments) });
        edges.push({ p1: idx, p2: ringStart + i });
      }
    } else if (shape === 'hyperboloid') {
      // 3. 3D Hourglass Ruled Hyperboloid Vortex
      const rings = 18;
      const R_top = 110;
      const R_mid = 48;
      const H = 220;

      for (let i = 0; i < rings; i++) {
        const theta = (Math.PI * 2 * i) / rings;
        // Top ring
        const idxTop = points.length;
        points.push({
          x: 0,
          y: 0,
          z: 0,
          targetX: Math.cos(theta) * R_top,
          targetY: -H * 0.5,
          targetZ: Math.sin(theta) * R_top,
        });

        // Bottom ring with angular skew (forming hyperboloid ruling lines)
        const thetaSkew = theta + (Math.PI * 0.7);
        const idxBot = points.length;
        points.push({
          x: 0,
          y: 0,
          z: 0,
          targetX: Math.cos(thetaSkew) * R_top,
          targetY: H * 0.5,
          targetZ: Math.sin(thetaSkew) * R_top,
        });

        // Ruling line from top to skewed bottom
        edges.push({ p1: idxTop, p2: idxBot });

        // Waist circle point
        const thetaMid = (theta + thetaSkew) * 0.5;
        const idxMid = points.length;
        points.push({
          x: 0,
          y: 0,
          z: 0,
          targetX: Math.cos(thetaMid) * R_mid,
          targetY: 0,
          targetZ: Math.sin(thetaMid) * R_mid,
        });

        edges.push({ p1: idxTop, p2: idxMid });
        edges.push({ p1: idxMid, p2: idxBot });
      }
    } else if (shape === 'stellated') {
      // 4. 3D Stellated Octahedron / 8-Point Merkaba Star
      const S = 95;
      const apexes = [
        [S, S, S], [S, -S, -S], [-S, S, -S], [-S, -S, S],
        [-S, -S, -S], [-S, S, S], [S, -S, S], [S, S, -S],
      ];

      apexes.forEach(([x, y, z]) => {
        points.push({ x: 0, y: 0, z: 0, targetX: x, targetY: y, targetZ: z });
      });

      // Internal octahedral center vertices
      const mid = S * 0.5;
      const coreVerts = [
        [mid, 0, 0], [-mid, 0, 0],
        [0, mid, 0], [0, -mid, 0],
        [0, 0, mid], [0, 0, -mid],
      ];

      const coreStart = points.length;
      coreVerts.forEach(([x, y, z]) => {
        points.push({ x: 0, y: 0, z: 0, targetX: x, targetY: y, targetZ: z });
      });

      // Connect star points to internal core
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 6; j++) {
          edges.push({ p1: i, p2: coreStart + j });
        }
      }
      // Connect core perimeter
      edges.push({ p1: coreStart, p2: coreStart + 2 });
      edges.push({ p1: coreStart + 2, p2: coreStart + 1 });
      edges.push({ p1: coreStart + 1, p2: coreStart + 3 });
      edges.push({ p1: coreStart + 3, p2: coreStart });
      edges.push({ p1: coreStart + 4, p2: coreStart });
      edges.push({ p1: coreStart + 5, p2: coreStart + 1 });
    } else if (shape === 'hexprism') {
      // 5. 3D Capped Hexagonal Cryptographic Prism
      const R = 100;
      const H = 180;
      const apexTop = points.length;
      points.push({ x: 0, y: 0, z: 0, targetX: 0, targetY: -H * 0.75, targetZ: 0 });

      const apexBot = points.length;
      points.push({ x: 0, y: 0, z: 0, targetX: 0, targetY: H * 0.75, targetZ: 0 });

      const topRingStart = points.length;
      for (let i = 0; i < 6; i++) {
        const theta = (Math.PI * 2 * i) / 6;
        points.push({
          x: 0,
          y: 0,
          z: 0,
          targetX: Math.cos(theta) * R,
          targetY: -H * 0.45,
          targetZ: Math.sin(theta) * R,
        });
      }

      const botRingStart = points.length;
      for (let i = 0; i < 6; i++) {
        const theta = (Math.PI * 2 * i) / 6;
        points.push({
          x: 0,
          y: 0,
          z: 0,
          targetX: Math.cos(theta) * R,
          targetY: H * 0.45,
          targetZ: Math.sin(theta) * R,
        });
      }

      // Connect hex edges
      for (let i = 0; i < 6; i++) {
        const next = (i + 1) % 6;
        // Top hex ring
        edges.push({ p1: topRingStart + i, p2: topRingStart + next });
        // Bottom hex ring
        edges.push({ p1: botRingStart + i, p2: botRingStart + next });
        // Vertical ribs
        edges.push({ p1: topRingStart + i, p2: botRingStart + i });
        // Cross diagonal
        edges.push({ p1: topRingStart + i, p2: botRingStart + next });
        // Caps
        edges.push({ p1: topRingStart + i, p2: apexTop });
        edges.push({ p1: botRingStart + i, p2: apexBot });
      }
    } else if (shape === 'knot') {
      // 6. 3D Trefoil Topological Infinity Knot
      const totalPoints = 36;
      for (let i = 0; i < totalPoints; i++) {
        const t = (Math.PI * 2 * i) / totalPoints;
        const x = (Math.sin(t) + 2 * Math.sin(2 * t)) * 36;
        const y = (Math.cos(t) - 2 * Math.cos(2 * t)) * 36;
        const z = -Math.sin(3 * t) * 55;

        const idx = points.length;
        points.push({ x: 0, y: 0, z: 0, targetX: x, targetY: y, targetZ: z });
        edges.push({ p1: idx, p2: (idx + 1) % totalPoints });

        // Cross truss to opposing turn
        if (i % 3 === 0) {
          const crossIdx = (idx + Math.floor(totalPoints / 3)) % totalPoints;
          edges.push({ p1: idx, p2: crossIdx });
        }
      }
    }

    return { points, edges };
  }, []);

  // Morph to new shape
  const morphToShape = useCallback(
    (newShape: ShapeType) => {
      const { points: newPoints, edges: newEdges } = buildGeometry(newShape);
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
          });
        }
      }

      pointsRef.current = resultPoints;
      edgesRef.current = newEdges;

      // Reset pulses along new edges
      if (newEdges.length > 0) {
        pulseParticlesRef.current = Array.from({ length: 32 }, () => ({
          edgeIdx: Math.floor(Math.random() * newEdges.length),
          progress: Math.random(),
          speed: 0.015 + Math.random() * 0.025,
        }));
      }
    },
    [buildGeometry]
  );

  // Initialize first shape (Icosahedron) and permanent pulses
  useEffect(() => {
    const initial = buildGeometry('icosahedron');
    pointsRef.current = initial.points.map((p) => ({
      ...p,
      x: p.targetX,
      y: p.targetY,
      z: p.targetZ,
    }));
    edgesRef.current = initial.edges;

    pulseParticlesRef.current = Array.from({ length: 32 }, () => ({
      edgeIdx: Math.floor(Math.random() * initial.edges.length),
      progress: Math.random(),
      speed: 0.015 + Math.random() * 0.025,
    }));
  }, [buildGeometry]);

  // Main 3D Canvas Loop with Permanent Pipeline Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const pW = canvas.parentElement?.clientWidth || 380;
      const pH = canvas.parentElement?.clientHeight || 420;

      if (canvas.width !== pW || canvas.height !== pH) {
        canvas.width = pW;
        canvas.height = pH;
      }

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Handle continuous rotation or inertia
      if (!isDraggingRef.current) {
        rotYRef.current += dragVelocityRef.current.x;
        rotXRef.current += dragVelocityRef.current.y;
        dragVelocityRef.current.x += (0.007 - dragVelocityRef.current.x) * 0.05;
        dragVelocityRef.current.y += (0.0025 - dragVelocityRef.current.y) * 0.05;
      }

      const cosY = Math.cos(rotYRef.current);
      const sinY = Math.sin(rotYRef.current);
      const cosX = Math.cos(rotXRef.current);
      const sinX = Math.sin(rotXRef.current);

      const points = pointsRef.current;
      const edges = edgesRef.current;

      // Smooth point morphing
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += (p.targetX - p.x) * 0.085;
        p.y += (p.targetY - p.y) * 0.085;
        p.z += (p.targetZ - p.z) * 0.085;
      }

      const fov = 400;
      const projected: { x: number; y: number; z: number; scale: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        const y1 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        const scale = fov / (fov + z2 + 150);
        const projX = width / 2 + x1 * scale;
        const projY = height / 2 + y1 * scale;

        projected.push({ x: projX, y: projY, z: z2, scale });
      }

      // Draw Wireframe Edges
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.7;

      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const p1 = projected[edge.p1];
        const p2 = projected[edge.p2];

        if (!p1 || !p2) continue;

        const depth = (p1.z + p2.z) * 0.5;
        const alpha = Math.max(0.18, Math.min(0.85, (depth + 180) / 360));

        ctx.strokeStyle = `rgba(15, 23, 42, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // ── PERMANENT LIVE DATA PACKETS FLOWING ALONG EDGES ─────────────
      const pulses = pulseParticlesRef.current;
      if (pulses.length > 0 && edges.length > 0) {
        ctx.setLineDash([]);
        for (let i = 0; i < pulses.length; i++) {
          const pulse = pulses[i];
          pulse.progress += pulse.speed;

          if (pulse.progress >= 1) {
            pulse.progress = 0;
            pulse.edgeIdx = Math.floor(Math.random() * edges.length);
          }

          const edge = edges[pulse.edgeIdx];
          if (!edge) continue;

          const p1 = projected[edge.p1];
          const p2 = projected[edge.p2];
          if (!p1 || !p2) continue;

          const px = p1.x + (p2.x - p1.x) * pulse.progress;
          const py = p1.y + (p2.y - p1.y) * pulse.progress;

          // Glowing traveling packet
          ctx.beginPath();
          ctx.arc(px, py, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.shadowColor = 'rgba(15, 23, 42, 0.75)';
          ctx.shadowBlur = 5;
          ctx.fill();

          // Crisp white center
          ctx.beginPath();
          ctx.arc(px, py, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // Draw Vertices
      ctx.setLineDash([]);
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const alpha = Math.max(0.2, Math.min(1, (p.z + 180) / 360));

        // Outer halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.2 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(15, 23, 42, ${alpha * 0.18})`;
        ctx.fill();

        // Core Black Node
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(15, 23, 42, ${alpha * 0.95})`;
        ctx.fill();

        // Center White dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Mouse & Touch Drag Controls for interactive 3D rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;

    rotYRef.current += dx * 0.008;
    rotXRef.current -= dy * 0.008;

    dragVelocityRef.current = { x: dx * 0.004, y: -dy * 0.004 };
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Smart Features definition (Left: 3, Right: 3)
  // Each maps to a unique brand-new 3D shape:
  const leftFeatures = [
    {
      id: 'matrix',
      icon: Cpu,
      title: 'Neural Matrix & Context Graphs',
      tag: 'Context Engine',
      stat: '2.4M Nodes',
      statSub: '< 1.2ms graph traversal',
      desc: 'Topological graph embedding. Query cross-database relationships in sub-millisecond traversals.',
      shapeTarget: 'icosahedron' as ShapeType,
    },
    {
      id: 'sandboxes',
      icon: Layers,
      title: 'Isolated MicroVM Sandboxes',
      tag: 'Zero-Trust Compute',
      stat: '100% Isolated',
      statSub: 'Sub-70ms cold starts',
      desc: 'Run untrusted agent code in hardware-isolated microVMs with instant freeze/thaw capabilities.',
      shapeTarget: 'diamond' as ShapeType,
    },
    {
      id: 'stream',
      icon: Zap,
      title: 'Real-Time Streaming Bus',
      tag: 'Low-Latency PubSub',
      stat: '140k msg/s',
      statSub: '0.8ms jitter SLA',
      desc: 'Embedded NATS & Redis pub/sub. Broadcast agent thoughts, token chunks, and status over WebSocket.',
      shapeTarget: 'hyperboloid' as ShapeType,
    },
  ];

  const rightFeatures = [
    {
      id: 'swarm',
      icon: GitFork,
      title: 'Multi-Agent Swarm Mesh',
      tag: 'Agent Mesh',
      stat: 'Dynamic Swarms',
      statSub: 'Hierarchical consensus',
      desc: 'Deploy cooperative multi-agent networks. Agents delegate sub-tasks and share context memory.',
      shapeTarget: 'stellated' as ShapeType,
    },
    {
      id: 'vault',
      icon: Shield,
      title: 'Enterprise RBAC & KMS Vault',
      tag: 'SOC2 & HIPAA',
      stat: 'AES-256-GCM',
      statSub: 'Hardware HSM lock',
      desc: 'Hardware security module (HSM) encryption for OpenAI, Anthropic, and Gemini keys with audit trails.',
      shapeTarget: 'hexprism' as ShapeType,
    },
    {
      id: 'telemetry',
      icon: Activity,
      title: 'OpenTelemetry Spans & Metrics',
      tag: 'Observability',
      stat: '100% Fidelity',
      statSub: 'Microsecond distributed spans',
      desc: 'Native OpenTelemetry distributed trace collector. Trace every prompt, tool call, and token cost.',
      shapeTarget: 'knot' as ShapeType,
    },
  ];

  return (
    <section
      id="product"
      ref={sectionRef}
      className="relative w-full py-14 sm:py-16 bg-white border-t border-slate-200/80 overflow-hidden scroll-mt-20"
    >
      <div id="features" className="absolute -top-20 pointer-events-none" />
      {/* Background Subtle Tech Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px), radial-gradient(rgba(15, 23, 42, 0.02) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      <div className="relative max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Clean, Uncluttered, No Shape Bar */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-instrument text-slate-900 leading-tight mb-2">
            Everything Required To Run Agents in Production
          </h2>

          <p className="text-slate-600 font-inter text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Deterministic speed, hardware-isolated microVMs, and enterprise compliance in a single real-time architecture.
          </p>
        </div>

        {/* ── Single-Screen Command Center Cockpit Grid ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {/* Left Column: 3 Smart Feature Cards */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 sm:gap-3.5">
            {leftFeatures.map((feat) => {
              const Icon = feat.icon;
              const isHovered = hoveredCard === feat.id;
              return (
                <div
                  key={feat.id}
                  onMouseEnter={() => {
                    setHoveredCard(feat.id);
                    morphToShape(feat.shapeTarget);
                  }}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative p-4 sm:p-4.5 rounded-2xl bg-white border transition-all duration-300 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${
                    isHovered
                      ? 'border-slate-800 shadow-[0_8px_24px_rgba(0,0,0,0.06)] -translate-y-0.5'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4 text-slate-800" />
                      </div>
                      <h3 className="text-[14px] sm:text-[15px] font-bold font-manrope text-slate-900 leading-tight">
                        {feat.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {feat.tag}
                    </span>
                  </div>

                  <p className="text-[12px] font-inter text-slate-600 leading-relaxed mb-2.5">
                    {feat.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-mono text-[11px]">
                    <span className="font-bold text-slate-900">{feat.stat}</span>
                    <span className="text-slate-500 text-[10.5px]">{feat.statSub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Column: Interactive 3D Wireframe Core with Permanent Pipeline Pulses */}
          <div className="lg:col-span-4 relative flex flex-col items-center justify-center rounded-2xl bg-slate-50/70 border border-slate-200/90 p-4 min-h-[400px] lg:min-h-[490px] shadow-xs overflow-hidden">
            {/* Interactive 3D Canvas */}
            <div className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="w-full h-full touch-none"
              />
            </div>
          </div>

          {/* Right Column: 3 Smart Feature Cards */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 sm:gap-3.5">
            {rightFeatures.map((feat) => {
              const Icon = feat.icon;
              const isHovered = hoveredCard === feat.id;
              return (
                <div
                  key={feat.id}
                  onMouseEnter={() => {
                    setHoveredCard(feat.id);
                    morphToShape(feat.shapeTarget);
                  }}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative p-4 sm:p-4.5 rounded-2xl bg-white border transition-all duration-300 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${
                    isHovered
                      ? 'border-slate-800 shadow-[0_8px_24px_rgba(0,0,0,0.06)] -translate-y-0.5'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4 text-slate-800" />
                      </div>
                      <h3 className="text-[14px] sm:text-[15px] font-bold font-manrope text-slate-900 leading-tight">
                        {feat.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {feat.tag}
                    </span>
                  </div>

                  <p className="text-[12px] font-inter text-slate-600 leading-relaxed mb-2.5">
                    {feat.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-mono text-[11px]">
                    <span className="font-bold text-slate-900">{feat.stat}</span>
                    <span className="text-slate-500 text-[10.5px]">{feat.statSub}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
