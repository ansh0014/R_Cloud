import { z } from 'zod'
import { DeploymentMode } from '../constants/runtime.constants.js'

const agentSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().optional(),
  entrypoint: z.string().min(1, 'Entrypoint is required'),
  system_prompt: z.string().optional(),
  env: z.record(z.string(), z.string()),
})

export const createRuntimeSchema = z.object({
  deployment_id: z.string().min(1, 'Deployment ID is required'),
  user_id: z.string().min(1, 'User ID is required'),
  repo_url: z.string().url('Repo URL must be a valid URL'),
  branch: z.string().min(1, 'Branch is required'),
  mode: z.nativeEnum(DeploymentMode),
  agents: z.array(agentSchema).min(1, 'At least one agent is required'),
})

export type CreateRuntimePayload = z.infer<typeof createRuntimeSchema>
