import io
import json
import gc
from pathlib import Path
from typing import List

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

# CONFIG
IMG_SIZE = (224, 224)
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

# INIT APP
app = FastAPI(
    title="Road Damage Detection API",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# GLOBAL MODEL (ONLY 1 ACTIVE)
CURRENT_MODEL = None
CURRENT_NAME = None
CURRENT_LABELS = None

AVAILABLE_MODELS: List[str] = []

# DISCOVER MODELS
def discover_models() -> List[str]:
    if not MODELS_DIR.exists():
        print("Folder 'models' tidak ditemukan")
        return []

    models = []
    for folder in MODELS_DIR.iterdir():
        if not folder.is_dir():
            continue

        if (folder / "model.h5").exists() and (folder / "labels.json").exists():
            models.append(folder.name)

    print(f"Models ditemukan: {models}")
    return models

# LOAD SINGLE MODEL (REPLACE)
def load_model_single(model_name: str):
    global CURRENT_MODEL, CURRENT_NAME, CURRENT_LABELS

    # kalau model sama → skip
    if CURRENT_NAME == model_name:
        return

    # unload model lama
    if CURRENT_MODEL is not None:
        print(f"🧹 Unload model: {CURRENT_NAME}")
        del CURRENT_MODEL
        gc.collect()

    try:
        model_path = MODELS_DIR / model_name / "model.h5"
        labels_path = MODELS_DIR / model_name / "labels.json"

        print(f"🚀 Loading model: {model_name}")
        model = tf.keras.models.load_model(model_path)

        with open(labels_path) as f:
            labels_json = json.load(f)

        labels = [labels_json[str(i)] for i in range(len(labels_json))]

        CURRENT_MODEL = model
        CURRENT_LABELS = labels
        CURRENT_NAME = model_name

        print(f"✅ Model '{model_name}' ready")

    except Exception as e:
        print(f"❌ Failed load '{model_name}': {e}")
        CURRENT_MODEL = None
        CURRENT_NAME = None
        CURRENT_LABELS = None

# STARTUP
@app.on_event("startup")
def startup():
    global AVAILABLE_MODELS
    AVAILABLE_MODELS = discover_models()

# IMAGE PREPROCESS
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = img.convert("RGB")
        img = img.resize(IMG_SIZE)
        arr = np.array(img, dtype=np.float32) / 255.0

    return np.expand_dims(arr, axis=0)

# ROUTES
@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/models")
def get_models():
    return {"available_models": AVAILABLE_MODELS}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_name: str = Form(...)
):
    # validasi model
    if model_name not in AVAILABLE_MODELS:
        return JSONResponse(
            status_code=400,
            content={
                "error": f"Model '{model_name}' tidak tersedia",
                "available_models": AVAILABLE_MODELS
            }
        )

    # validasi file
    if not file.content_type.startswith("image/"):
        return JSONResponse(
            status_code=400,
            content={"error": "File harus gambar 🖼️"}
        )

    try:
        # load model (replace kalau beda)
        load_model_single(model_name)

        if CURRENT_MODEL is None:
            return JSONResponse(
                status_code=500,
                content={"error": "Model gagal diload"}
            )

        # baca image
        image_bytes = await file.read()
        img = preprocess_image(image_bytes)

        # predict
        preds = CURRENT_MODEL.predict(img)[0]
        top_idx = np.argsort(preds)[::-1][:3]

        results = [
            {
                "class": CURRENT_LABELS[i],
                "confidence": round(float(preds[i]) * 100, 2)
            }
            for i in top_idx
        ]

        # cleanup
        del img, preds
        gc.collect()

        return {
            "model": CURRENT_NAME,
            "predictions": results
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )