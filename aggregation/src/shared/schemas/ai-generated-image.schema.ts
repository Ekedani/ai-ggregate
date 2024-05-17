import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AiGeneratedData } from './ai-generated-data.schema';
import { HydratedDocument } from 'mongoose';

export type AiGeneratedImageDocument = HydratedDocument<AiGeneratedImage>;

@Schema()
export class AiGeneratedImage extends AiGeneratedData {
  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop()
  altText?: string;

  @Prop({ type: Object })
  dimensions?: {
    width: number;
    height: number;
  };

  @Prop()
  format?: string;

  @Prop({ type: [String] })
  contentTags?: string[];

  @Prop({ type: [String] })
  technicalTags?: string[];
}

export const AiGeneratedImageSchema =
  SchemaFactory.createForClass(AiGeneratedImage);
AiGeneratedImageSchema.index(
  { 'provider.name': 1, originalId: 1 },
  { unique: true },
);
