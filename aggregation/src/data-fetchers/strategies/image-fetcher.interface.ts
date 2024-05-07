import { AiGeneratedImage } from '../../shared/schemas/ai-generated-image.schema';
import { Provider } from '../../shared/schemas/provider.schema';

export interface ImageFetcher {
  provider: Provider;

  fetchData(): Promise<AiGeneratedImage[]>;
}
