import { Prop } from '@nestjs/mongoose';

export class Provider {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: false })
  isTrusted: boolean;
}
