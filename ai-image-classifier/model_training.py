from fastai.vision.all import *
from fastai.vision.augment import Resize


def setup_and_train():
    dataset_path = 'dataset\\train'
    model_path = 'models'

    os.makedirs(model_path, exist_ok=True)
    dls = ImageDataLoaders.from_folder(
        dataset_path,
        valid_pct=0.2,
        seed=42,
        item_tfms=Resize(224)
    )

    learn = vision_learner(dls, resnet34, metrics=accuracy)

    early_stop_callback = EarlyStoppingCallback(monitor='valid_loss', min_delta=0.01, patience=3)
    save_model_callback = SaveModelCallback(fname='best_model', every_epoch=False, with_opt=True)

    learn.lr_find()
    learn.fit_one_cycle(20, cbs=[early_stop_callback, save_model_callback])

    learn.save(f'resnet34_image_classifier_v4.pth')
    learn.export(f'resnet34_image_classifier_v4.pkl')
    print("Saved GenAI image classifier model to disk")

    return learn, model_path


def plot_results(learn):
    plt.figure(figsize=(10, 4))
    learn.recorder.plot_lr_find()
    plt.title("Learning Rate Finder")
    plt.xlabel("Learning Rate")
    plt.ylabel("Loss")
    plt.savefig(f'learning_rate_finder.png')

    plt.figure(figsize=(10, 4))
    learn.recorder.plot_loss()
    plt.title("Training and Validation Loss")
    plt.xlabel("Iterations")
    plt.ylabel("Loss")
    plt.savefig(f'training_validation_loss.png')

    interp = ClassificationInterpretation.from_learner(learn)

    interp.plot_top_losses(6, figsize=(15, 11))
    plt.savefig(f'top_losses.png')

    interp.plot_confusion_matrix(figsize=(10, 8))
    plt.savefig(f'confusion_matrix.png')


if __name__ == '__main__':
    learn, model_path = setup_and_train()
    plot_results(learn)
