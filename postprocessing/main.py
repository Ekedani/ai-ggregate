import logging

from flask import Flask, request, jsonify
from services.minio_service import MinioService
from services.mongo_service import MongoService
from services.labeling_service import LabelingService
from services.thumbnail_service import ThumbnailService
from waitress import serve

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)


class ContentProcessor:
    def __init__(self):
        self.minio_service = MinioService()
        self.mongo_service = MongoService()
        self.labeling_service = LabelingService()
        self.thumbnail_service = ThumbnailService()

    def process_new_image(self, image_id):
        """
        Processes an AI-generated image by retrieving it from Minio, labeling it via Google Vision, creating a thumbnail,
        and updating the MongoDB with the labels and thumbnail.

        :param image_id: The ID of the image to be processed.
        :return: True if the image was successfully processed, False otherwise.
        """
        logging.info("Processing new image")
        try:
            storage_key = self.mongo_service.get_storage_key_by_image_id(image_id)
            if not storage_key:
                logging.error("No storage key found")
                return False

            image_data = self.minio_service.get_image(storage_key)
            if not image_data:
                logging.error("Failed to retrieve image from Minio")
                return False

            labels = self.labeling_service.get_labels(image_data.data)
            if not labels:
                logging.error("Failed to retrieve labels")
                return False
            self.mongo_service.update_image_labels(image_id, labels)

            thumbnail = self.thumbnail_service.get_thumbnail(image_data.data)
            if not thumbnail:
                logging.error("Failed to create thumbnail")
                return False
            thumbnail_key = f'{image_id}.webp'
            self.minio_service.put_thumbnail(thumbnail_key, thumbnail)
            self.mongo_service.update_image_thumbnail(image_id, thumbnail_key)
            return True

        except Exception as e:
            logging.error(f"Error processing new image: {e}")
            return False


content_processor = ContentProcessor()


@app.route('/images', methods=['POST'])
def process_image_endpoint():
    """
    Endpoint to process an AI-generated image. Expects a JSON payload with an 'imageId' key.

    :return: JSON response indicating status of the postprocessing.
    """
    image_id = request.json.get('imageId')
    if not image_id:
        return jsonify({'error': 'Image ID is required'}), 400

    success = content_processor.process_new_image(image_id)
    if success:
        return jsonify({'message': 'Image processed successfully'}), 200
    else:
        return jsonify({'error': 'Failed to process image'}), 500


if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=5000)
