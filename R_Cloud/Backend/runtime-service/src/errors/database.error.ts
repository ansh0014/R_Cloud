import { status } from '@grpc/grpc-js'
import { ErrorCode } from '../constants/error.constants.js'
import { BaseError } from './base.error.js'

export class DatabaseError extends BaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(
      message,
      ErrorCode.DATABASE_ERROR,
      status.INTERNAL,
      details
    )
  }
}
