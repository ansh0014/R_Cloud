import { db } from '../database/postgres.js'
import { RuntimeStatus, HealthStatus } from '../constants/runtime.constants.js'

export class RuntimeRepository {
  
  async createRuntime(
    deploymentId: string,
    railwayProjectId: string
  ) {
    const query = `
      INSERT INTO runtime_registry (
        deployment_id, 
        provider, 
        railway_project_id, 
        status, 
        health
      ) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `
    
    const values = [
      deploymentId,
      'railway',
      railwayProjectId,
      RuntimeStatus.CREATING, 
      HealthStatus.STARTING   
    ]

    const result = await db.query(query, values)
    return result.rows[0] 
  }

  async createAgent(
    runtimeId: string,
    name: string,
    agentUrl: string,
    railwayServiceId: string
  ) {
    const query = `
      INSERT INTO agent_registry (
        runtime_id,
        name,
        agent_url,
        railway_service_id
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `
    const values = [runtimeId, name, agentUrl, railwayServiceId]
    const result = await db.query(query, values)
    return result.rows[0]
  }
}

export const runtimeRepository = new RuntimeRepository()
