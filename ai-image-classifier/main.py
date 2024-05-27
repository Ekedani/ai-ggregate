import os
import platform
import pathlib

plt = platform.system()
if plt != 'Windows':
    pathlib.WindowsPath = pathlib.PosixPath

from flask import Flask, request, jsonify
from fastai.vision.all import load_learner, PILImage
import logging
from waitress import serve

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

models = {}


def load_genai_image_classifiers():
    model_dir = 'models'
    for model_file in os.listdir(model_dir):
        if model_file.endswith('.pkl'):
            logging.info(f'Loading model: {model_file}')
            model_name = os.path.splitext(model_file)[0]
            models[model_name] = load_learner(os.path.join(model_dir, model_file))


load_genai_image_classifiers()
BEST_CLASSIFIER = 'resnet34_image_classifier_v4'


def get_prediction(model, request):
    model_obj = models.get(model)
    if not model_obj:
        return jsonify({'error': f'Model "{model}" not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file and file.filename != '':
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in ['jpg', 'jpeg', 'png', 'webp']):
            return jsonify({'error': 'File format not supported'}), 400

        image = PILImage.create(file.read()).resize((224, 224))
        pred, pred_idx, probs = model_obj.predict(image)

        return jsonify({
            'label': str(pred),
            'model': model,
            'confidence': float(probs[pred_idx])
        }), 200

    return jsonify({'error': 'Invalid file'}), 400


@app.route('/prediction', methods=['POST'])
def predict_using_best_model():
    return get_prediction(BEST_CLASSIFIER, request)


@app.route('/<model>/prediction', methods=['POST'])
def predict_using_custom_model(model):
    return get_prediction(model, request)


if __name__ == '__main__':
    logging.info('Starting the GenAI image classification service')
    serve(app, host="0.0.0.0", port=5000)
