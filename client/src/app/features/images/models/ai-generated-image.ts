export interface AiGeneratedImage {
  _id: string;
  prompt?: string;
  negativePrompt?: string;
  model?: string;
  author: {
    name: string;
    id?: string;
  };
  classification?: {
    label: string;
    model: string;
    confidence: number;
  };
  createdAt: Date;
  storageKey?: string;
  originalId?: string;
  provider?: string;
  publicationUrl?: string;
  thumbnailKey?: string;
  originalImageUrl?: string;
  altText?: string;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
  size: number;
  contentTags?: string[];
  technicalTags?: string[];
}
