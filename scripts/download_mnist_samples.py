"""
Descarga 100 dígitos aleatorios de MNIST y los guarda como PNG para subirlos a S3
o servirlos localmente en el carrusel de Digit Recognizer.

Requisitos:
  pip install torchvision pillow
"""

import random
from pathlib import Path

from torchvision import datasets


# Soporta ejecución como script y desde notebooks (donde __file__ no existe).
try:
    ROOT_DIR = Path(__file__).resolve().parent.parent
except NameError:
    ROOT_DIR = Path.cwd()

OUTPUT_DIR = ROOT_DIR / "page" / "public" / "mnist_samples"
DATA_DIR = ROOT_DIR / "data" / "mnist"
NUM_IMAGES = 100
SEED = 42


def main():
    random.seed(SEED)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    dataset = datasets.MNIST(root=DATA_DIR, train=False, download=True)
    indices = random.sample(range(len(dataset)), NUM_IMAGES)

    for idx in indices:
        img, label = dataset[idx]
        filename = OUTPUT_DIR / f"mnist_{idx:05d}_label{label}.png"
        img.save(filename)

    manifest_path = OUTPUT_DIR / "manifest.txt"
    manifest_path.write_text(
        "\n".join(sorted(p.name for p in OUTPUT_DIR.glob("mnist_*_label*.png")))
    )
    print(f"Guardadas {len(indices)} imágenes en {OUTPUT_DIR}")
    print(f"Manifest creado en {manifest_path}")


if __name__ == "__main__":
    main()
