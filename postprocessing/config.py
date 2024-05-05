from dotenv import load_dotenv
import os

load_dotenv()


class Config:
    GOOGLE_VISION_API_KEY = os.getenv('GOOGLE_VISION_API_KEY')
    CONTENT_DB_URI = os.getenv('CONTENT_DB_URI')
    MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT')
    MINIO_PORT = os.getenv('MINIO_PORT')
    MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY')
    MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY')
