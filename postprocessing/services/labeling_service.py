import requests
import base64
from config import Config


class LabelingService:
    @staticmethod
    def get_labels(image_data: bytes):
        url = f'https://vision.googleapis.com/v1/images:annotate?key={Config.GOOGLE_VISION_API_KEY}'
        headers = {'Content-Type': 'application/json'}
        content = base64.b64encode(image_data).decode('UTF-8')
        payload = {
            "requests": [{
                "image": {"content": content},
                "features": [{"type": "LABEL_DETECTION"}]
            }]
        }
        response = requests.post(url, headers=headers, json=payload)
        result = response.json()

        labels = []
        if 'responses' in result:
            for resp in result['responses']:
                if 'labelAnnotations' in resp:
                    labels.extend([label['description'] for label in resp['labelAnnotations']])
        return labels
