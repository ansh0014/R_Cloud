import { status } from '@grpc/grpc-js'
import { ErrorCode } from '../constants/error.constants.js'

export class BaseError extends Error {
  public readonly code: ErrorCode
  public readonly grpcStatus: status
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    code: ErrorCode,
    grpcStatus: status,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.grpcStatus = grpcStatus
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}
