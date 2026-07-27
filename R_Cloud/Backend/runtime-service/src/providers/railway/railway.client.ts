import { config } from '../../config/config.js'
import { RailwayApiError } from '../../errors/railway.error.js'

export class RailwayClient {
  private readonly apiUrl = 'https://backboard.railway.app/graphql/v2'
  
  // Every request MUST have this token, otherwise Railway rejects us
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
      
      // If Railway returns a GraphQL error array, throw it!
      if (json.errors) {
        throw new Error(json.errors[0].message)
      }
      return json.data
    } catch (error) {
      throw new RailwayApiError('Failed to communicate with Railway API', { originalError: error, query })
    }
  }

  /**
   * STEP 1: Create an empty bucket (Project)
   */
  async createProject(name: string) {
    const query = `
      mutation CreateProject($name: String!) {
        projectCreate(input: { name: $name }) {
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
    const data = await this.executeQuery(query, { name })
    
    // Railway automatically creates a 'production' environment inside the new project.
    // We need BOTH the projectId and the environmentId for the next steps!
    return {
      projectId: data.projectCreate.id as string,
      environmentId: data.projectCreate.environments.edges[0].node.id as string
    }
  }

  /**
   * STEP 2: Connect GitHub Repo and boot up the code (Service)
   */
  async createService(projectId: string, repoUrl: string, branch: string, startCommand: string) {
    const query = `
      mutation CreateService($projectId: String!, $repoUrl: String!, $branch: String!, $startCommand: String!) {
        serviceCreate(input: {
          projectId: $projectId,
          source: {
            repo: $repoUrl,
            branch: $branch
          },
          startCommand: $startCommand
        }) {
          id
        }
      }
    `
    const variables = { projectId, repoUrl, branch, startCommand }
    const data = await this.executeQuery(query, variables)
    
    return data.serviceCreate.id as string
  }

  /**
   * STEP 3: Inject the Environment Variables so the code doesn't crash
   */
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

  /**
   * STEP 4: Delete an entire project (and all its agents)
   */
  async deleteProject(projectId: string) {
    const query = `
      mutation DeleteProject($projectId: String!) {
        projectDelete(id: $projectId)
      }
    `
    await this.executeQuery(query, { projectId })
  }

  /**
   * STEP 5: Restart a specific agent (if it crashes)
   */
  async restartService(serviceId: string) {
    const query = `
      mutation RestartService($serviceId: String!) {
        serviceInstanceRedeploy(serviceId: $serviceId)
      }
    `
    await this.executeQuery(query, { serviceId })
  }

  /**
   * STEP 6: Get the latest deployment status for a service in an environment
   */
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

  /**
   * STEP 7: Create a public domain for a service (so we can call its endpoints)
   */
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

// Export a single instance (Singleton) to use everywhere
export const railwayClient = new RailwayClient()
