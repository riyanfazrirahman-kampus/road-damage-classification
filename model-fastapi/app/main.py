import io
import json
import numpy as np
from typing import Dict

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import tensorflow as tf
from tensorflow.keras.preprocessing import image as tf_image


# KONFIGURASI
IMG_SIZE = (224, 224)
MODELS_DIR = "models"


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


# STORAGE MODEL
MODEL_STORE: Dict[str, Dict] = {}
"""
{
  "mobilenet_v2": {
      "model": keras_model,
      "labels": ["alur", "lubang", ...]
  }
}
"""


# LOADERS
def load_model_bundle(model_name: str):
    try:
        model = tf.keras.models.load_model(
            f"{MODELS_DIR}/{model_name}/model.h5"
        )
        with open(f"{MODELS_DIR}/{model_name}/labels.json") as f:
            labels_json = json.load(f)

        labels = [labels_json[str(i)] for i in range(len(labels_json))]

        MODEL_STORE[model_name] = {
            "model": model,
            "labels": labels
        }

        print(f"✅ Model '{model_name}' loaded")

    except Exception as e:
        print(f"❌ Failed load {model_name}: {e}")


@app.on_event("startup")
def startup():
    # Daftar model yang mau diload
    models_to_load = [
        "mobilenetv2_01",
        "mobilenetv2_02",
        "mobilenetv2_03",
    ]

    for model_name in models_to_load:
        load_model_bundle(model_name)


# UTIL
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes))

    if image.mode != "RGB":
        image = image.convert("RGB")

    image = image.resize(IMG_SIZE)
    img_array = tf_image.img_to_array(image) / 255.0

    return np.expand_dims(img_array, axis=0)


# ROUTES
@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/models")
def root():
    return {
        "available_models": list(MODEL_STORE.keys())
    }


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
            content={"error": "File bukan gambar"}
        )

    bundle = MODEL_STORE[model_name]
    model = bundle["model"]
    labels = bundle["labels"]

    image_bytes = await file.read()
    processed_image = preprocess_image(image_bytes)

    preds = model.predict(processed_image)[0]
    sorted_idx = np.argsort(preds)[::-1][:3]

    results = [
        {
            "class": labels[i],
            "confidence": round(float(preds[i]) * 100, 2)
        }
        for i in sorted_idx
    ]

    return {
        "model": model_name,
        "predictions": results
    }
