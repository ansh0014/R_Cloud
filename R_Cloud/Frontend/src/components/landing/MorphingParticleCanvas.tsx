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

// ── 3D Rubik's Cube Architecture ─────────────────────────────────────────────
interface CubieFace {
  normal: [number, number, number];
  u: [number, number, number];
  v: [number, number, number];
  hasSticker: boolean;
  color: string;
}

interface Cubie {
  pos: [number, number, number]; // [-1, 0, 1] discrete positions
  faces: CubieFace[];
}

interface RubikMove {
  axis: 'x' | 'y' | 'z';
  layer: number; // -1, 0, or 1
  dir: 1 | -1;
}

const PALETTE_STICKERS = {
  top: '#F7F9F7',    // -Y: Soft White
  bottom: '#0F3B27', // +Y: Move Green
  front: '#92FF5F',  // +Z: Signal Lime
  back: '#062013',   // -Z: Deep Forest Emerald
  right: '#FF843E',  // +X: Tech Orange
  left: '#CFF1D2',   // -X: Mint Ice
};

// Vector 3D rotation around cardinal axis
function rotVec(v: [number, number, number], axis: 'x' | 'y' | 'z', angle: number): [number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const [x, y, z] = v;
  if (axis === 'x') {
    return [x, y * cos - z * sin, z * cos + y * sin];
  } else if (axis === 'y') {
    return [x * cos - z * sin, y, z * cos + x * sin];
  } else {
    return [x * cos - y * sin, y * cos + x * sin, z];
  }
}

function roundVec(v: [number, number, number]): [number, number, number] {
  return [Math.round(v[0]), Math.round(v[1]), Math.round(v[2])];
}

const createInitialRubikCubies = (): Cubie[] => {
  const cubies: Cubie[] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue; // skip core center

        const faces: CubieFace[] = [
          // 0: Right (+X)
          {
            normal: [1, 0, 0],
            u: [0, 0, -1],
            v: [0, 1, 0],
            hasSticker: x === 1,
            color: x === 1 ? PALETTE_STICKERS.right : '#061A0F',
          },
          // 1: Left (-X)
          {
            normal: [-1, 0, 0],
            u: [0, 0, 1],
            v: [0, 1, 0],
            hasSticker: x === -1,
            color: x === -1 ? PALETTE_STICKERS.left : '#061A0F',
          },
          // 2: Bottom (+Y)
          {
            normal: [0, 1, 0],
            u: [1, 0, 0],
            v: [0, 0, -1],
            hasSticker: y === 1,
            color: y === 1 ? PALETTE_STICKERS.bottom : '#061A0F',
          },
          // 3: Top (-Y)
          {
            normal: [0, -1, 0],
            u: [1, 0, 0],
            v: [0, 0, 1],
            hasSticker: y === -1,
            color: y === -1 ? PALETTE_STICKERS.top : '#061A0F',
          },
          // 4: Front (+Z)
          {
            normal: [0, 0, 1],
            u: [1, 0, 0],
            v: [0, 1, 0],
            hasSticker: z === 1,
            color: z === 1 ? PALETTE_STICKERS.front : '#061A0F',
          },
          // 5: Back (-Z)
          {
            normal: [0, 0, -1],
            u: [-1, 0, 0],
            v: [0, 1, 0],
            hasSticker: z === -1,
            color: z === -1 ? PALETTE_STICKERS.back : '#061A0F',
          },
        ];

        cubies.push({
          pos: [x, y, z],
          faces,
        });
      }
    }
  }
  return cubies;
};

// 6 distinct realistic Rubik's moves for the sequence
const SCRAMBLE_MOVES: RubikMove[] = [
  { axis: 'x', layer: 1, dir: 1 },    // R
  { axis: 'y', layer: -1, dir: -1 },  // U'
  { axis: 'z', layer: 1, dir: 1 },    // F
  { axis: 'x', layer: -1, dir: -1 },  // L'
  { axis: 'y', layer: 1, dir: 1 },     // D
  { axis: 'z', layer: -1, dir: -1 },  // B'
];

// Solving moves are the exact algorithmic inverse in reverse order
const SOLVE_MOVES: RubikMove[] = SCRAMBLE_MOVES.slice()
  .reverse()
  .map((m) => ({
    axis: m.axis,
    layer: m.layer,
    dir: (m.dir === 1 ? -1 : 1) as 1 | -1,
  }));

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
  const rotYRef = useRef<number>(0.3);
  const rotXRef = useRef<number>(0.28);
  const lightProgressTargetRef = useRef<number>(0);
  const currentLightProgressRef = useRef<number>(0);

  // Rubik's Cube State
  const cubiesRef = useRef<Cubie[]>(createInitialRubikCubies());
  const rubikPhaseRef = useRef<'scrambling' | 'pause_before_solve' | 'solving' | 'celebration'>('scrambling');
  const moveIndexRef = useRef<number>(0);
  const turnFrameRef = useRef<number>(0);
  const pauseFrameRef = useRef<number>(0);
  const celebrationFrameRef = useRef<number>(0);

  // Interactive mouse/touch dragging
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragVelocityRef = useRef<{ x: number; y: number }>({ x: 0.007, y: 0.003 });

  useEffect(() => {
    lightProgressTargetRef.current = lightProgress ?? (currentStep >= 0 ? 1 : 0);
  }, [lightProgress, currentStep]);

  // Generate target shapes with 1:1 isometric proportions
  const generateShape = useCallback((shape: ShapeMode) => {
    const points: Point3D[] = [];
    const edges: Edge[] = [];

    if (shape === 'cube') {
      // 3D Partitioned Dashed Wireframe Cube
      const S = 115; // Clean proportions with safe corner margins
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
        // Continuous 3D rotation in Hero and Story with inertia
        if (!isDraggingRef.current) {
          rotYRef.current += dragVelocityRef.current.x;
          rotXRef.current += dragVelocityRef.current.y;
          dragVelocityRef.current.x += (0.007 - dragVelocityRef.current.x) * 0.04;
          dragVelocityRef.current.y += (0.003 - dragVelocityRef.current.y) * 0.04;
        }
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

      // Dynamic scale factor calibrated so rotating corners never get clipped by canvas boundaries
      const minDimension = Math.min(width, height);
      const autoScaleFactor = Math.max(0.78, Math.min(1.10, minDimension / 540));

      // ── 3D FILLED RUBIK'S CUBE SOLVER (HERO SECTION) ───────────────────────
      currentLightProgressRef.current +=
        (lightProgressTargetRef.current - currentLightProgressRef.current) * 0.12;
      const lp = currentLightProgressRef.current;

      if (lp < 0.95 && shapeModeRef.current === 'cube') {
        const rubikAlpha = Math.max(0, 1 - lp * 2.2);

        // Turn choreography parameters
        const TURN_DURATION = 20; // ~330ms per 90-degree layer turn
        const PAUSE_DURATION = 7;
        const CELEBRATION_DURATION = 90; // ~1.5s solved celebration shine

        let activeMove: RubikMove | null = null;
        let turnAngle = 0;

        const phase = rubikPhaseRef.current;
        const currentMovesList = phase === 'scrambling' ? SCRAMBLE_MOVES : SOLVE_MOVES;

        if (phase === 'scrambling' || phase === 'solving') {
          if (pauseFrameRef.current > 0) {
            pauseFrameRef.current--;
          } else {
            activeMove = currentMovesList[moveIndexRef.current];
            turnFrameRef.current++;

            const t = Math.min(1, turnFrameRef.current / TURN_DURATION);
            // Smooth cubic easeInOut for fluid physical rotation
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            turnAngle = ease * (Math.PI / 2) * activeMove.dir;

            if (turnFrameRef.current >= TURN_DURATION) {
              // Commit exact 90-degree integer step to cubies in active layer
              const axis = activeMove.axis;
              const layer = activeMove.layer;
              const targetAngle = (Math.PI / 2) * activeMove.dir;

              cubiesRef.current.forEach((cubie) => {
                const coord = axis === 'x' ? cubie.pos[0] : axis === 'y' ? cubie.pos[1] : cubie.pos[2];
                if (coord === layer) {
                  cubie.pos = roundVec(rotVec(cubie.pos, axis, targetAngle));
                  cubie.faces.forEach((f) => {
                    f.normal = roundVec(rotVec(f.normal, axis, targetAngle));
                    f.u = roundVec(rotVec(f.u, axis, targetAngle));
                    f.v = roundVec(rotVec(f.v, axis, targetAngle));
                  });
                }
              });

              turnFrameRef.current = 0;
              moveIndexRef.current++;
              pauseFrameRef.current = PAUSE_DURATION;

              if (moveIndexRef.current >= currentMovesList.length) {
                moveIndexRef.current = 0;
                if (phase === 'scrambling') {
                  rubikPhaseRef.current = 'pause_before_solve';
                  pauseFrameRef.current = 22; // ~360ms "AI graph reasoning" pause
                } else {
                  rubikPhaseRef.current = 'celebration';
                  celebrationFrameRef.current = 0;
                }
              }
            }
          }
        } else if (phase === 'pause_before_solve') {
          pauseFrameRef.current--;
          if (pauseFrameRef.current <= 0) {
            rubikPhaseRef.current = 'solving';
            moveIndexRef.current = 0;
            turnFrameRef.current = 0;
            pauseFrameRef.current = 4;
          }
        } else if (phase === 'celebration') {
          celebrationFrameRef.current++;
          if (celebrationFrameRef.current >= CELEBRATION_DURATION) {
            // Re-verify clean solved state and restart continuous cycle
            cubiesRef.current = createInitialRubikCubies();
            rubikPhaseRef.current = 'scrambling';
            moveIndexRef.current = 0;
            turnFrameRef.current = 0;
            pauseFrameRef.current = 14;
          }
        }

        // Geometry sizing - Significantly increased for prominent, grand presence in Hero
        const PITCH = 82; // distance between cubie centers (increased from 58)
        const CUBIE_HALF = 38; // cubie backing box half-extent (increased from 26)
        const STICKER_HALF = 32.5; // colored facelet tile half-extent (increased from 22.5)

        interface RenderQuad {
          backingPts2D: { x: number; y: number }[];
          stickerPts2D: { x: number; y: number }[] | null;
          avgZ: number;
          hasSticker: boolean;
          color: string;
          normalDot: number;
          center3D: [number, number, number];
        }

        const renderQueue: RenderQuad[] = [];
        const lightDir: [number, number, number] = [0.28, -0.62, -0.73];
        const fov = 440;

        cubiesRef.current.forEach((cubie) => {
          let pos: [number, number, number] = [cubie.pos[0] * PITCH, cubie.pos[1] * PITCH, cubie.pos[2] * PITCH];
          let isRotating = false;

          if (activeMove) {
            const coord = activeMove.axis === 'x' ? cubie.pos[0] : activeMove.axis === 'y' ? cubie.pos[1] : cubie.pos[2];
            if (coord === activeMove.layer) {
              isRotating = true;
              pos = rotVec(pos, activeMove.axis, turnAngle);
            }
          }

          cubie.faces.forEach((face) => {
            let n = face.normal;
            let u = face.u;
            let v = face.v;

            if (isRotating && activeMove) {
              n = rotVec(n, activeMove.axis, turnAngle);
              u = rotVec(u, activeMove.axis, turnAngle);
              v = rotVec(v, activeMove.axis, turnAngle);
            }

            // World space normal rotated by current view angles into camera space
            const wnx1 = n[0] * cosY - n[2] * sinY;
            const wnz1 = n[2] * cosY + n[0] * sinY;
            const wny = n[1] * cosX - wnz1 * sinX;
            const wnz = wnz1 * cosX + n[1] * sinX;

            // Robust Camera-Space Backface Culling:
            // Camera looks down +Z. Face is visible if and only if normal points towards camera (wnz < -0.01)
            if (wnz < -0.01) {
              // World space face center
              const scX = pos[0] + n[0] * CUBIE_HALF;
              const scY = pos[1] + n[1] * CUBIE_HALF;
              const scZ = pos[2] + n[2] * CUBIE_HALF;

              const uOffsets = [-1, 1, 1, -1];
              const vOffsets = [-1, -1, 1, 1];

              // 4 corners of the dark cubie backing
              const backingPts2D: { x: number; y: number }[] = [];
              let sumZ = 0;

              for (let c = 0; c < 4; c++) {
                const cu = uOffsets[c];
                const cv = vOffsets[c];

                const bx = (scX + (u[0] * cu + v[0] * cv) * CUBIE_HALF) * autoScaleFactor;
                const by = (scY + (u[1] * cu + v[1] * cv) * CUBIE_HALF) * autoScaleFactor;
                const bz = (scZ + (u[2] * cu + v[2] * cv) * CUBIE_HALF) * autoScaleFactor;

                const bx1 = bx * cosY - bz * sinY;
                const bz1 = bz * cosY + bx * sinY;
                const by1 = by * cosX - bz1 * sinX;
                const bz2 = bz1 * cosX + by * sinX;

                const bscale = fov / (fov + bz2 + 130);
                backingPts2D.push({
                  x: width / 2 + bx1 * bscale,
                  y: height / 2 + by1 * bscale,
                });
                sumZ += bz2;
              }

              // 4 corners of the filled colored sticker (if exterior facelet)
              let stickerPts2D: { x: number; y: number }[] | null = null;
              if (face.hasSticker) {
                stickerPts2D = [];
                for (let c = 0; c < 4; c++) {
                  const cu = uOffsets[c];
                  const cv = vOffsets[c];

                  const sx = (scX + (u[0] * cu + v[0] * cv) * STICKER_HALF) * autoScaleFactor;
                  const sy = (scY + (u[1] * cu + v[1] * cv) * STICKER_HALF) * autoScaleFactor;
                  const sz = (scZ + (u[2] * cu + v[2] * cv) * STICKER_HALF) * autoScaleFactor;

                  const x1 = sx * cosY - sz * sinY;
                  const z1 = sz * cosY + sx * sinY;
                  const y1 = sy * cosX - z1 * sinX;
                  const z2 = z1 * cosX + sy * sinX;

                  const scale = fov / (fov + z2 + 130);
                  stickerPts2D.push({
                    x: width / 2 + x1 * scale,
                    y: height / 2 + y1 * scale,
                  });
                }
              }

              const dot = Math.max(0, -(wnx1 * lightDir[0] + wny * lightDir[1] + wnz * lightDir[2]));

              renderQueue.push({
                backingPts2D,
                stickerPts2D,
                avgZ: sumZ / 4,
                hasSticker: face.hasSticker,
                color: face.color,
                normalDot: dot,
                center3D: [scX, scY, scZ],
              });
            }
          });
        });

        // Depth sort back to front (Painter's algorithm)
        renderQueue.sort((a, b) => b.avgZ - a.avgZ);

        ctx.save();
        ctx.globalAlpha = rubikAlpha;

        renderQueue.forEach((quad) => {
          // 1. Solid Dark Cubie Face Backing (Guarantees 100% solid, non-hollow appearance on every slice)
          ctx.beginPath();
          ctx.moveTo(quad.backingPts2D[0].x, quad.backingPts2D[0].y);
          for (let k = 1; k < 4; k++) {
            ctx.lineTo(quad.backingPts2D[k].x, quad.backingPts2D[k].y);
          }
          ctx.closePath();

          // Diffuse shading for the cubie backing
          const backingShade = 0.65 + quad.normalDot * 0.35;
          ctx.fillStyle = quad.hasSticker
            ? '#04130A'
            : `rgba(6, 26, 15, ${backingShade})`;
          ctx.fill();
          ctx.strokeStyle = 'rgba(15, 59, 39, 0.55)';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // 2. Filled Colored Sticker Tile (Exterior faces)
          if (quad.hasSticker && quad.stickerPts2D) {
            ctx.beginPath();
            ctx.moveTo(quad.stickerPts2D[0].x, quad.stickerPts2D[0].y);
            for (let k = 1; k < 4; k++) {
              ctx.lineTo(quad.stickerPts2D[k].x, quad.stickerPts2D[k].y);
            }
            ctx.closePath();

            // Dynamic Shading: Ambient + Directional Light
            const shade = 0.75 + quad.normalDot * 0.35;
            ctx.fillStyle = quad.color;
            ctx.fill();

            // Ambient depth overlay
            if (shade < 1) {
              ctx.fillStyle = `rgba(0, 0, 0, ${(1 - shade) * 0.32})`;
              ctx.fill();
            }

            // Specular luminous sweep during solved celebration
            if (phase === 'celebration') {
              const shineProgress = celebrationFrameRef.current / CELEBRATION_DURATION;
              const wavePos = -220 + shineProgress * 440;
              const distToWave = Math.abs(quad.center3D[0] + quad.center3D[1] - wavePos);
              if (distToWave < 80) {
                const shineAlpha = (1 - distToWave / 80) * 0.75;
                ctx.fillStyle = `rgba(146, 255, 95, ${shineAlpha})`;
                ctx.fill();
              }
            }

            // Crisp subtle inner highlight border for premium sticker bevel
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        });

        ctx.restore();
      }

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

      // Draw dashed wireframe edges & nodes for other shapes, or as scroll morphing occurs
      if (shapeModeRef.current !== 'cube' || lp > 0.25) {
        const wireAlpha = shapeModeRef.current === 'cube' ? Math.min(1.0, (lp - 0.25) * 2.5) : 1.0;

        ctx.save();
        ctx.globalAlpha = wireAlpha;

        // Color interpolation: White (255, 255, 255) -> Move Green (15, 59, 39)
        const edgeR = Math.round(255 * (1 - lp) + 15 * lp);
        const edgeG = Math.round(255 * (1 - lp) + 59 * lp);
        const edgeB = Math.round(255 * (1 - lp) + 39 * lp);

        if (isRectangle) {
          // High-tech crisp Move Green perimeter border line
          ctx.setLineDash([8, 5]);
          ctx.lineWidth = 2.4;
          ctx.shadowColor = 'rgba(15, 59, 39, 0.25)';
          ctx.shadowBlur = 4;
          ctx.strokeStyle = '#0F3B27';
        } else {
          ctx.setLineDash([7, 4]);
          ctx.lineWidth = 2.4;
          if (lp < 0.5) {
            ctx.shadowColor = `rgba(146, 255, 95, ${(1 - lp * 2) * 0.5})`;
            ctx.shadowBlur = Math.round(6 * (1 - lp * 2));
          } else {
            ctx.shadowColor = `rgba(15, 59, 39, ${(lp - 0.5) * 0.2})`;
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
            const alpha = Math.max(0.62, Math.min(1.0, (depth + 220) / 440));
            ctx.strokeStyle = `rgba(${edgeR}, ${edgeG}, ${edgeB}, ${alpha * (lp > 0.5 ? 0.85 : 0.95)})`;
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
            ctx.shadowColor = 'rgba(15, 59, 39, 0.35)';
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#0F3B27';
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          } else {
            const alpha = Math.max(0.45, Math.min(1.0, (p.z + 200) / 400));

            if (lp < 0.5) {
              const glowAlpha = 1 - lp * 2;
              ctx.shadowColor = `rgba(146, 255, 95, ${glowAlpha * 0.95})`;
              ctx.shadowBlur = 10 * glowAlpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 5.5 * p.scale, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(146, 255, 95, ${alpha * 0.45 * glowAlpha})`;
              ctx.fill();

              ctx.beginPath();
              ctx.arc(p.x, p.y, 3.2 * p.scale, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(146, 255, 95, ${alpha * 0.9})`;
              ctx.fill();

              ctx.shadowBlur = 4 * glowAlpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.5 * p.scale, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
            } else {
              const darkFactor = (lp - 0.5) * 2;
              ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
              ctx.shadowBlur = 1;

              ctx.beginPath();
              ctx.arc(p.x, p.y, 4.5 * p.scale, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(15, 23, 42, ${alpha * 0.18 * darkFactor})`;
              ctx.fill();

              ctx.beginPath();
              ctx.arc(p.x, p.y, 2.8 * p.scale, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(10, 10, 10, ${alpha * 0.95})`;
              ctx.fill();
            }
          }
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Mouse & Touch Drag Controls for interactive 3D orbit
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;

    rotYRef.current += dx * 0.009;
    rotXRef.current -= dy * 0.009;

    dragVelocityRef.current = { x: dx * 0.004, y: -dy * 0.004 };
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none"
      title="Interactive 3D Solving Rubik's Cube"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative z-10 w-full h-full pointer-events-auto touch-none cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
