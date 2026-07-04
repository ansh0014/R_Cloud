import { status } from '@grpc/grpc-js'
import { ErrorCode } from '../constants/error.constants.js'
import { BaseError } from './base.error.js'

export class ValidationError extends BaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(
      message,
      ErrorCode.VALIDATION_FAILED,
      status.INVALID_ARGUMENT,
      details
    )
  }
}
