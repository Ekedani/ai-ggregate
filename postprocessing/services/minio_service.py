from io import BytesIO

from minio import Minio
from config import Config


class MinioService:
    def __init__(self):
        self.client = Minio(
            f'{Config.MINIO_ENDPOINT}:{Config.MINIO_PORT}',
            access_key=Config.MINIO_ACCESS_KEY,
            secret_key=Config.MINIO_SECRET_KEY,
            secure=False
        )

    def get_image(self, storage_key):
        return self.client.get_object('genai-images', storage_key)

    def put_thumbnail(self, storage_key, thumbnail):
        return self.client.put_object(
            'genai-thumbnails',
            storage_key,
            thumbnail,
            len(thumbnail.getbuffer())
        )
