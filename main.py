import re
import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences


model_path = "Artifacts/BiGRU_model.keras"
tokenizer_path = "Artifacts/tokenizer.pkl"

max_sequence_length = 66
emotion_labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']
EMOTION_EMOJIS = {
    "sadness": "😢",
    "joy": "😂",
    "love": "❤️",
    "anger": "😡",
    "fear": "😨",
    "surprise": "😲"
}

# Preprocessing Upcoming Text
def preprocess_text(text:str)->str:
    text = text.lower()
    text = re.sub(r"'","",text)
    text = re.sub(r"[^a-z0-9\s]"," ", text)
    text = re.sub(r"\s+"," ", text).strip()
    return text

class TextInput(BaseModel):
    text : str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The sentence to analyze.",
    )

class PredictionResponse(BaseModel):
    text: str
    predicted_emotion: str
    predicted_emotion: str
    confidence: float
    all_probabilities: dict[str, float]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


dl_model = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    dl_model["BiGRU"]=load_model(model_path)
    with open(tokenizer_path, "rb") as file:
        dl_model["Tokenizer"] = pickle.load(file)
    print("Models are loaded successfully")

    yield
    dl_model.clear()

app = FastAPI(
    lifespan = lifespan
)
app.add_middleware(
     CORSMiddleware,
     allow_origins=["*"],
     allow_credentials = True,
     allow_methods=["*"],
     allow_headers=["*"]
 )

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", include_in_schema=False)
def serve_ui():
    return FileResponse("static/index.html")

@app.get("/health", response_model = HealthResponse)
def health_check():
    return HealthResponse(
        status="Server is Running",
        model_loaded=bool(dl_model)
    )


@app.post("/predict", response_model=PredictionResponse)
def predict_emotion(text_input: TextInput):
    BiGRU_model = dl_model.get("BiGRU")
    tokenizer_model = dl_model.get("Tokenizer")

    if BiGRU_model is None or tokenizer_model is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded yet. Please try again."
        )

    cleaned_text = preprocess_text(text_input.text)

    # Tokenizer expects a list of strings
    tokenized_text = tokenizer_model.texts_to_sequences([cleaned_text])

    padded_sequence = pad_sequences(
        tokenized_text,
        maxlen=max_sequence_length,
        padding="post",
        truncating="post"
    )

    probabilities = BiGRU_model.predict(padded_sequence, verbose=0)[0]

    top_emotion_index = int(np.argmax(probabilities))
    predicted_emotion = emotion_labels[top_emotion_index]

    all_probabilities = {
        label: float(prob)
        for label, prob in zip(emotion_labels, probabilities)
    }

    return PredictionResponse(
        text=text_input.text,
        predicted_emotion=predicted_emotion,
        emoji=EMOTION_EMOJIS[predicted_emotion],
        confidence=float(probabilities[top_emotion_index]),
        all_probabilities=all_probabilities
                )
