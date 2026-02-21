import io
import json
from pathlib import Path
from typing import Dict, List

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

# CONFIG
IMG_SIZE = (224, 224)
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "../../model-classification/models"

# INIT APP
app = FastAPI(
    title="Road Damage Detection API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# MODEL STORAGE
MODEL_STORE: Dict[str, Dict] = {}


# MODEL DISCOVERY
def discover_models() -> List[str]:
    if not MODELS_DIR.exists():
        print("Folder 'models' tidak ditemukan")
        return []

    models = []
    for folder in MODELS_DIR.iterdir():
        if not folder.is_dir():
            continue

        model_file = folder / "model.h5"
        labels_file = folder / "labels.json"

        if model_file.exists() and labels_file.exists():
            models.append(folder.name)
        else:
            print(f"Skip '{folder.name}' (file tidak lengkap)")

    print(f"Models ditemukan: {models}")
    return models


# LOAD MODEL
def load_model_bundle(model_name: str):
    try:
        model_path = MODELS_DIR / model_name / "model.h5"
        labels_path = MODELS_DIR / model_name / "labels.json"

        model = tf.keras.models.load_model(model_path)

        with open(labels_path) as f:
            labels_json = json.load(f)

        labels = [labels_json[str(i)] for i in range(len(labels_json))]

        MODEL_STORE[model_name] = {
            "model": model,
            "labels": labels
        }

        print(f"Model '{model_name}' loaded")

    except Exception as e:
        print(f"Failed load '{model_name}': {e}")


@app.on_event("startup")
def startup():
    for model_name in discover_models():
        load_model_bundle(model_name)


# IMAGE PREPROCESS
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


# ROUTES
@app.get("/")
def root():
    return {"status": "ok."}

@app.get("/models")
def get_models():
    return {"available_models": sorted(MODEL_STORE.keys())}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_name: str = Form(...)
):
    if model_name not in MODEL_STORE:
        return JSONResponse(
            status_code=400,
            content={
                "error": f"Model '{model_name}' tidak tersedia",
                "available_models": list(MODEL_STORE.keys())
            }
        )

    if not file.content_type.startswith("image/"):
        return JSONResponse(
            status_code=400,
            content={"error": "File harus gambar 🖼️"}
        )

    bundle = MODEL_STORE[model_name]
    image_bytes = await file.read()
    img = preprocess_image(image_bytes)

    preds = bundle["model"].predict(img)[0]
    top_idx = np.argsort(preds)[::-1][:3]

    results = [
        {
            "class": bundle["labels"][i],
            "confidence": round(float(preds[i]) * 100, 2)
        }
        for i in top_idx
    ]

    return {
        "model": model_name,
        "predictions": results
    }