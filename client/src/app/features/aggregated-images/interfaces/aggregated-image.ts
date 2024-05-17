import {AggregatedData} from "./aggregated-data";

export interface AggregatedImage extends AggregatedData {
  imageUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  format?: string;
  contentTags?: string[];
  technicalTags?: string[];
}
