import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AiGeneratedData } from '../../shared/schemas/ai-generated-data.schema';
import { HydratedDocument } from 'mongoose';

export type AiGeneratedImageDocument = HydratedDocument<AiGeneratedImage>;

@Schema()
export class AiGeneratedImage extends AiGeneratedData {
  @Prop()
  originalImageUrl?: string;

  @Prop()
  altText?: string;

  @Prop({ type: Object, required: true })
  dimensions: {
    width: number;
    height: number;
  };

  @Prop({ required: true })
  format: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: [String] })
  contentTags?: string[];

  @Prop({ type: [String] })
  technicalTags?: string[];
}

export const AiGeneratedImageSchema =
  SchemaFactory.createForClass(AiGeneratedImage);
AiGeneratedImageSchema.index(
  { provider: 1, originalId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      provider: { $type: 'string' },
      originalId: { $type: 'string' },
    },
  },
);
