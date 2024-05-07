import { Prop } from '@nestjs/mongoose';

export abstract class AiGeneratedData {
  @Prop({})
  prompt?: string;

  @Prop()
  negativePrompt?: string;

  @Prop()
  model?: string;

  @Prop({ type: Object, required: true })
  author?: {
    name: string;
    id?: string;
  };

  @Prop({ type: Object })
  classification?: {
    label: string;
    model: string;
    confidence: number;
  };

  @Prop({ type: Date, default: () => new Date() })
  createdAt?: Date;

  @Prop({})
  storageKey?: string;

  @Prop()
  originalId?: string;

  @Prop()
  provider?: string;

  @Prop()
  publicationUrl?: string;

  @Prop()
  thumbnailKey?: string;
}
