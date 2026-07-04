import { status } from '@grpc/grpc-js'
import { ErrorCode } from '../constants/error.constants.js'
import { BaseError } from './base.error.js'

export class RuntimeNotFoundError extends BaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(
      message,
      ErrorCode.RUNTIME_NOT_FOUND,
      status.NOT_FOUND,
      details
    )
  }
}
