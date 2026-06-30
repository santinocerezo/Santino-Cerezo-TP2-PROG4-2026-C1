import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Error as MongooseError } from 'mongoose';
import { Response } from 'express';

/**
 * Traduce los errores de Mongoose que NO son HttpException (y que, por eso,
 * Nest devolvería como 500 "Internal server error" en inglés) a respuestas
 * claras con código 400 y mensaje en español.
 *
 * - ValidationError: por ejemplo, un campo obligatorio que quedó vacío.
 * - CastError: por ejemplo, un id con formato inválido en la URL.
 */
@Catch(MongooseError.ValidationError, MongooseError.CastError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(
    exception: MongooseError.ValidationError | MongooseError.CastError,
    host: ArgumentsHost,
  ) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof MongooseError.ValidationError) {
      const campos = Object.keys(exception.errors);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Hay datos inválidos o campos obligatorios vacíos: ${campos.join(', ')}`,
        error: 'Bad Request',
      });
    }

    // CastError (id u otro valor con formato inválido).
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'El dato enviado tiene un formato inválido',
      error: 'Bad Request',
    });
  }
}
