import { runtimeRepository } from '../registry/runtime.repository.js'
import { railwayClient } from '../providers/railway/railway.client.js'
import { publishEvent } from '../events/publisher.js'
import { RuntimeEvent } from '../constants/events.constants.js'
import { RuntimeStatus, HealthStatus } from '../constants/runtime.constants.js'
import { config } from '../config/config.js'
import { logger } from '../telemetry/logger.js'

/**
 * Handles auto-restart logic for unhealthy runtimes.
 * If under the maximum restart limit, restarts all associated services on Railway.
 * Otherwise, transitions the runtime to FAILED status.
 */
export async function handleUnhealthyRuntime(runtimeId: string): Promise<void> {
  try {
    const runtime = await runtimeRepository.getRuntime(runtimeId)
    if (!runtime) {
      logger.error({ runtimeId }, 'Cannot handle unhealthy status: Runtime not found')
      return
    }

    const currentCount = runtime.restart_count || 0
    const maxAttempts = config.MAX_RESTART_ATTEMPTS

    if (currentCount < maxAttempts) {
      logger.info(
        { runtimeId, currentCount, maxAttempts },
        'Unhealthy runtime is under the restart limit. Initiating service restart...'
      )

      // 1. Set state to RESTARTING and UNHEALTHY in the database
      await runtimeRepository.updateRuntimeStatus(runtimeId, RuntimeStatus.RESTARTING, HealthStatus.UNHEALTHY)

      // 2. Fetch all registered agents to get their Railway service IDs
      const agents = await runtimeRepository.getAgentsByRuntime(runtimeId)

      // 3. Command Railway API to redeploy/restart each service
      for (const agent of agents) {
        if (agent.railway_service_id) {
          logger.info(
            { runtimeId, agentName: agent.name, serviceId: agent.railway_service_id },
            'Restarting Railway service container'
          )
          await railwayClient.restartService(agent.railway_service_id)
        }
      }

      // 4. Increment the restart counter in PostgreSQL
      const updatedRuntime = await runtimeRepository.incrementRestartCount(runtimeId)

      // 5. Publish NATS event: runtime.restarted
      publishEvent(RuntimeEvent.RESTARTED, {
        runtimeId,
        restartCount: updatedRuntime.restart_count
      })
      
      logger.info({ runtimeId, newCount: updatedRuntime.restart_count }, 'Runtime restart initiated successfully')
    } else {
      logger.warn(
        { runtimeId, currentCount, maxAttempts },
        'Runtime exceeded maximum restart attempts. Marking as FAILED.'
      )

      // Transition to permanent FAILED state
      await runtimeRepository.updateRuntimeStatus(runtimeId, RuntimeStatus.FAILED, HealthStatus.UNHEALTHY)

      // Publish NATS event: runtime.failed
      publishEvent(RuntimeEvent.FAILED, {
        runtimeId,
        reason: `Exceeded maximum auto-restart attempts (${maxAttempts})`
      })
    }
  } catch (err) {
    logger.error({ err, runtimeId }, 'Error occurred inside handleUnhealthyRuntime')
  }
}
