from pymongo import MongoClient
from config import Config
from bson import ObjectId


class MongoService:
    def __init__(self):
        self.client = MongoClient(Config.CONTENT_DB_URI)
        self.db = self.client['content']
        self.collection = self.db['aigeneratedimages']

    def listen_to_changes(self):
        return self.collection.watch()

    def update_image_labels(self, image_id, labels):
        self.collection.update_one({'_id': ObjectId(image_id)}, {'$addToSet': {
            'contentTags': {'$each': labels}
        }})

    def update_image_thumbnail(self, image_id, thumbnail_key):
        self.collection.update_one({'_id': ObjectId(image_id)}, {
            '$set': {'thumbnailKey': thumbnail_key}
        })

    def get_storage_key_by_image_id(self, image_id):
        return self.collection.find_one({'_id': ObjectId(image_id)})['storageKey']
