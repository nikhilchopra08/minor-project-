import { ApiResponse } from './types';

export class ResponseHelper {
  static success<T>(message: string, data?: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, error?: string): ApiResponse {
    return {
      success: false,
      message,
      error,
    };
  }

  static json<T>(data: ApiResponse<T>, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static unauthorized(message: string = 'Unauthorized'): Response {
    return this.json(this.error(message), 401);
  }

  static forbidden(message: string = 'Forbidden'): Response {
    return this.json(this.error(message), 403);
  }

  static badRequest(message: string = 'Bad Request', error?: string): Response {
    return this.json(this.error(message, error), 400);
  }

  static notFound(message: string = 'Not Found'): Response {
    return this.json(this.error(message), 404);
  }

  static internalError(message: string = 'Internal Server Error'): Response {
    return this.json(this.error(message), 500);
  }

  static conflict(message: string = 'Conflict'): Response {
    return this.json(this.error(message), 409);
  }
}