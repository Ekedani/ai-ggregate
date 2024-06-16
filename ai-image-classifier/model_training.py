import os

import matplotlib.pyplot as plt
from fastai.callback.tracker import EarlyStoppingCallback, SaveModelCallback
from fastai.interpret import ClassificationInterpretation
from fastai.metrics import accuracy
from fastai.vision.augment import Resize
from fastai.vision.data import ImageDataLoaders
from fastai.vision.learner import vision_learner
from fastai.vision.models import resnet34


def setup_and_train_genai_classifier():
    """
    Trains a GenAI classifier using a ResNet34 model. The custom dataset (described in docs)
    is loaded from the specified path; the model is saved after training.

    :return: The trained learner object and the model path.
    """

    genai_dataset_path = 'dataset\\train'
    models_directory_path = 'models'

    os.makedirs(models_directory_path, exist_ok=True)
    dls = ImageDataLoaders.from_folder(
        genai_dataset_path,
        valid_pct=0.2,
        seed=42,
        item_tfms=Resize(224)
    )

    # Using ResNet34 model pretrained on ImageNet dataset as a base
    genai_classifier_learn = vision_learner(dls, resnet34, metrics=accuracy)

    early_stop_callback = EarlyStoppingCallback(monitor='valid_loss', min_delta=0.01, patience=3)
    save_model_callback = SaveModelCallback(fname='best_model', every_epoch=False, with_opt=True)

    # The best results are achieved before 20 iterations
    genai_classifier_learn.lr_find()
    genai_classifier_learn.fit_one_cycle(20, cbs=[early_stop_callback, save_model_callback])

    genai_classifier_learn.save('resnet34_image_classifier_v4.pth')
    genai_classifier_learn.export('resnet34_image_classifier_v4.pkl')
    print('Saved GenAI image classifier model to disk')

    return genai_classifier_learn, models_directory_path


def test_and_plot_results(genai_classifier_learn):
    """
    Tests the trained GenAI classifier and plots the results. Used for efficiency testing

    :param genai_classifier_learn: The trained learner object.
    """
    # Statistic information about learner
    plt.figure(figsize=(10, 4))
    genai_classifier_learn.recorder.plot_lr_find()
    plt.title("Learning Rate Finder")
    plt.xlabel("Learning Rate")
    plt.ylabel("Loss")
    plt.savefig(f'learning_rate_finder.png')

    plt.figure(figsize=(10, 4))
    genai_classifier_learn.recorder.plot_loss()
    plt.title("Training and Validation Loss")
    plt.xlabel("Iterations")
    plt.ylabel("Loss")
    plt.savefig(f'training_validation_loss.png')

    interpretation = ClassificationInterpretation.from_learner(genai_classifier_learn)

    # Most often shows real images with defects
    interpretation.plot_top_losses(6, figsize=(15, 11))
    plt.savefig(f'top_losses.png')

    interpretation.plot_confusion_matrix(figsize=(10, 8))
    plt.savefig(f'confusion_matrix.png')


if __name__ == '__main__':
    genai_classifier_learn, model_path = setup_and_train_genai_classifier()
    test_and_plot_results(genai_classifier_learn)
