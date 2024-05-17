from PIL import Image
import io


class ThumbnailService:
    def __init__(self, max_size=(512, 512), format='WEBP', quality=75):
        self.max_size = max_size
        self.format = format
        self.quality = quality

    def get_thumbnail(self, image_data):
        try:
            with Image.open(io.BytesIO(image_data)) as img:
                if img.mode not in ('RGB', 'RGBA'):
                    img = img.convert('RGBA')

                img.thumbnail(self.max_size, Image.Resampling.LANCZOS)
                buffer = io.BytesIO()
                img.save(buffer, format=self.format, quality=self.quality)
                buffer.seek(0)
                return buffer

        except Exception as e:
            print(e)
            return None
