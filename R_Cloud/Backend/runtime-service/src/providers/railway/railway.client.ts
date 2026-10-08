import { config } from '../../config/config.js'
import { RailwayApiError } from '../../errors/railway.error.js'

export class RailwayClient {
  private readonly apiUrl = 'https://backboard.railway.app/graphql/v2'
  private cachedWorkspaceId: string | null = null
  
  private readonly headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.RAILWAY_API_TOKEN}`
  }

  /**
   * Core function to send GraphQL queries to Railway
   */
  private async executeQuery(query: string, variables: any = {}) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ query, variables })
      })
      const json = (await response.json()) as any
      
      if (json.errors && json.errors.length > 0) {
        const errMsg = json.errors.map((e: any) => e.message).join('; ')
        throw new RailwayApiError(errMsg, { errors: json.errors, query })
      }
      return json.data
    } catch (error) {
      if (error instanceof RailwayApiError) {
        throw error
      }
      const errMsg = error instanceof Error ? error.message : 'Failed to communicate with Railway API'
      throw new RailwayApiError(errMsg, { originalError: String(error), query })
    }
  }

  async getWorkspaceId(): Promise<string | null> {
    if (this.cachedWorkspaceId) return this.cachedWorkspaceId
    try {
      const data = await this.executeQuery(`query { me { workspaces { id } } }`)
      const ws = data?.me?.workspaces?.[0]?.id
      if (ws) {
        this.cachedWorkspaceId = ws
        return ws
      }
    } catch {
      // workspace fetch optional fallback
    }
    return null
  }
  
  async createProject(name: string) {
    const workspaceId = await this.getWorkspaceId()
    const query = `
      mutation CreateProject($name: String!, $workspaceId: String) {
        projectCreate(input: { name: $name, workspaceId: $workspaceId }) {
          id
          environments {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `
    const data = await this.executeQuery(query, { name, workspaceId })
    
    // Railway automatically creates a 'production' environment inside the new project.
    // We need BOTH the projectId and the environmentId for the next steps!
    return {
      projectId: data.projectCreate.id as string,
      environmentId: data.projectCreate.environments.edges[0].node.id as string
    }
  }

  async createService(projectId: string, repoUrl: string, branch: string) {
    const repo = repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '')
    const query = `
      mutation CreateService($projectId: String!, $repo: String!, $branch: String) {
        serviceCreate(input: {
          projectId: $projectId,
          branch: $branch,
          source: {
            repo: $repo
          }
        }) {
          id
        }
      }
    `
    const variables = { projectId, repo, branch }
    const data = await this.executeQuery(query, variables)
    
    return data.serviceCreate.id as string
  }

  async updateServiceInstance(environmentId: string, serviceId: string, input: { startCommand?: string; buildCommand?: string }) {
    const query = `
      mutation UpdateServiceInstance($environmentId: String!, $serviceId: String!, $input: ServiceInstanceUpdateInput!) {
        serviceInstanceUpdate(
          environmentId: $environmentId,
          serviceId: $serviceId,
          input: $input
        )
      }
    `
    await this.executeQuery(query, { environmentId, serviceId, input })
  }

  async setEnvironmentVariables(projectId: string, environmentId: string, serviceId: string, envVars: Record<string, string>) {
    const query = `
      mutation UpsertVariables($projectId: String!, $environmentId: String!, $serviceId: String!, $variables: Object!) {
        variableCollectionUpsert(input: {
          projectId: $projectId,
          environmentId: $environmentId,
          serviceId: $serviceId,
          variables: $variables
        })
      }
    `
    const variables = { projectId, environmentId, serviceId, variables: envVars }
    await this.executeQuery(query, variables)
  }

  async deleteProject(projectId: string) {
    const query = `
      mutation DeleteProject($projectId: String!) {
        projectDelete(id: $projectId)
      }
    `
    await this.executeQuery(query, { projectId })
  }

  async restartService(serviceId: string) {
    const query = `
      mutation RestartService($serviceId: String!) {
        serviceInstanceRedeploy(serviceId: $serviceId)
      }
    `
    await this.executeQuery(query, { serviceId })
  }

  async getLatestDeploymentStatus(serviceId: string, environmentId: string): Promise<string> {
    const query = `
      query GetLatestDeploymentStatus($serviceId: String!, $environmentId: String!) {
        deployments(input: { serviceId: $serviceId, environmentId: $environmentId }) {
          edges {
            node {
              status
            }
          }
        }
      }
    `
    const data = await this.executeQuery(query, { serviceId, environmentId })
    const edge = data.deployments?.edges?.[0]
    return edge ? (edge.node.status as string) : 'UNKNOWN'
  }

  
  async createServiceDomain(environmentId: string, serviceId: string): Promise<string> {
    const query = `
      mutation CreateServiceDomain($environmentId: String!, $serviceId: String!) {
        serviceDomainCreate(input: {
          environmentId: $environmentId,
          serviceId: $serviceId
        }) {
          domain
        }
      }
    `
    const data = await this.executeQuery(query, { environmentId, serviceId })
    return data.serviceDomainCreate.domain as string
  }
}

export const railwayClient = new RailwayClient()
