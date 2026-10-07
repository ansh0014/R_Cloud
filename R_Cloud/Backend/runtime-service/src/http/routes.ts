import { Router, Request, Response } from 'express';
import { runtimeRepository } from '../registry/runtime.repository.js';

const router = Router();

// Health Check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'runtime-service' });
});

// Runtime Lookup by Deployment ID (used by API Gateway proxy)
const getByDeploymentHandler = async (req: Request, res: Response) => {
  try {
    const deploymentId = String(req.params.deploymentId);
    const runtime = await runtimeRepository.getRuntimeByDeploymentId(deploymentId);
    if (!runtime) {
      res.status(404).json({
        success: false,
        error: { message: `Runtime not found for deployment ${deploymentId}` }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: runtime.id,
        deploymentId: runtime.deployment_id,
        runtimeUrl: runtime.runtime_url || '',
        status: runtime.status,
        health: runtime.health
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err?.message || 'Internal error' } });
  }
};

router.get('/by-deployment/:deploymentId', getByDeploymentHandler);
router.get('/api/v1/runtimes/by-deployment/:deploymentId', getByDeploymentHandler);

// Runtime Lookup by ID
const getByIdHandler = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const runtime = await runtimeRepository.getRuntime(id);
    if (!runtime) {
      res.status(404).json({
        success: false,
        error: { message: `Runtime not found for id ${id}` }
      });
      return;
    }

    const agents = await runtimeRepository.getAgentsByRuntime(id);
    res.json({
      success: true,
      data: {
        ...runtime,
        agents: agents || []
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err?.message || 'Internal error' } });
  }
};

router.get('/:id', getByIdHandler);
router.get('/api/v1/runtimes/:id', getByIdHandler);

// List Active Runtimes
const listRuntimesHandler = async (_req: Request, res: Response) => {
  try {
    const runtimes = await runtimeRepository.getActiveRuntimes();
    res.json({
      success: true,
      data: runtimes || []
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err?.message || 'Internal error' } });
  }
};

router.get('/', listRuntimesHandler);
router.get('/api/v1/runtimes', listRuntimesHandler);

// Runtime Contract Endpoints
router.post('/execute', (req: Request, res: Response) => {
  res.json({ output: 'Execution result from agent', input: req.body });
});

router.post('/stream', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.write('data: {"chunk": "..."}\n\n');
  res.end();
});

router.get('/metadata', (_req: Request, res: Response) => {
  res.json({
    name: 'Customer Support Agent',
    framework: 'LangGraph',
    version: '1.0.0',
    capabilities: ['chat', 'rag']
  });
});

export default router;
