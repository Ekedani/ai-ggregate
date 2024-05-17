import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidateMongoIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    try {
      new Types.ObjectId(value);
      return value;
    } catch (error) {
      throw new BadRequestException('Invalid ObjectId');
    }
  }
}
