import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints ?? {}),
        }));

        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    });
  }


  transform(value: any, metadata: ArgumentMetadata) {
    return super.transform(value, metadata);
  }
}
