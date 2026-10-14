<div align="center">

# 🎭 Text Emotion Analyzer

**A deep learning web app that reads a sentence and tells you the emotion behind it.**

BiGRU · NLP · FastAPI · TensorFlow/Keras · Render

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.17-FF6F00?logo=tensorflow&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=white)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-brightgreen)](https://dl-nlp-project-text-emotion-analyzer.onrender.com)

[Live Demo](https://dl-nlp-project-text-emotion-analyzer.onrender.com) · [Features](#-features) · [Model](#-model-architecture) · [API](#-api-reference) · [Run Locally](#-run-locally) · [Deploy](#-deploy-on-render)

</div>

---

## 📌 Overview

Text Emotion Analyzer classifies English text into one of **six emotions**: sadness, joy, love, anger, fear and surprise. It uses a **Bidirectional GRU (BiGRU)** neural network trained on emotion-labelled text. The trained model is served through a **FastAPI** backend, and a responsive HTML/CSS/JS interface sends text to the API and displays the result in real time.

The project covers the full ML pipeline: text preprocessing, tokenization, model training, packaging the model, building a REST API, a frontend, and cloud deployment.

## 🚀 Live Demo

> 🔗 **Try it here: [https://dl-nlp-project-text-emotion-analyzer.onrender.com](https://dl-nlp-project-text-emotion-analyzer.onrender.com)**
>
> The free Render tier sleeps when idle, so the first request can take 30-60 seconds.

## ✨ Features

- **Six-class emotion detection** with a confidence score for every class
- **BiGRU model** that reads the sentence in both directions for better context
- **REST API** built with FastAPI, with automatic Swagger docs at `/docs`
- **Interactive UI** with an animated background that changes colour with the detected emotion, emoji results, animated probability bars, example sentences, and a history of recent predictions
- **Input validation** with Pydantic (1-2000 characters)
- **Health endpoint** for monitoring and deployment checks
- **Ready for deployment** with `render.yaml` and a pinned `requirements.txt`

## 🧠 Model Architecture

| Layer | Details |
|---|---|
| Input | Padded token sequence, length **66** |
| Embedding | Vocabulary **10,000**, dimension **300** |
| Bidirectional GRU | **128** units per direction (256 combined output) |
| Dropout | Rate **0.5** |
| Dense (output) | **6** units, softmax |

- **Loss:** sparse categorical cross-entropy
- **Labels:** `sadness`, `joy`, `love`, `anger`, `fear`, `surprise`
- **Saved files:** `Artifacts/BiGRU_model.keras` (model) and `Artifacts/tokenizer.pkl` (fitted Keras tokenizer)

### Preprocessing pipeline

The same steps run at training time and at prediction time:

1. Convert to lowercase
2. Remove apostrophes
3. Replace non-alphanumeric characters with spaces
4. Collapse repeated whitespace
5. Convert to integer sequences with the saved tokenizer
6. Pad or truncate to length 66 (`padding="post"`, `truncating="post"`)

> ⚠️ The padding side must match training. The BiGRU gives wrong predictions if it is changed.

## 📊 Results

> Fill in these values from your notebook.

| Metric | Score |
|---|---|
| Test accuracy | `XX.X%` |
| Weighted F1-score | `XX.X%` |
| Dataset size | `XX,XXX samples` |

You can add a confusion matrix image here: `![Confusion Matrix](assets/confusion_matrix.png)`

## 📁 Project Structure

```
.
├── main.py                              # FastAPI application
├── requirements.txt                     # Python dependencies
├── render.yaml                          # Render deployment config
├── Artifacts/
│   ├── BiGRU_model.keras                # Trained model
│   └── tokenizer.pkl                    # Fitted tokenizer
├── static/
│   ├── index.html                       # Frontend page
│   ├── style.css                        # Styling and animations
│   └── script.js                        # API calls and UI logic
└── DL + NLP Project_ Emotion Classification.ipynb   # Training notebook
```

## 🔌 API Reference

Interactive docs are available at [`/docs`](https://dl-nlp-project-text-emotion-analyzer.onrender.com/docs) (Swagger UI) when the server is running.

### `GET /health`

Checks whether the server is up and the model is loaded.

```json
{ "status": "Server is Running", "model_loaded": true }
```

### `POST /predict`

**Request**

```json
{ "text": "i feel really happy and excited about today" }
```

**Response**

```json
{
  "text": "i feel really happy and excited about today",
  "predicted_emotion": "joy",
  "emoji": "😂",
  "confidence": 0.99,
  "all_probabilities": {
    "sadness": 0.001,
    "joy": 0.99,
    "love": 0.002,
    "anger": 0.003,
    "fear": 0.002,
    "surprise": 0.002
  }
}
```

**cURL example**

```bash
curl -X POST https://dl-nlp-project-text-emotion-analyzer.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "i feel so lonely and empty without her"}'
```

**Errors:** `422` for invalid input (empty or over 2000 characters), `503` if the model is not loaded yet.

## 💻 Run Locally

**Requirements:** Python 3.11 (TensorFlow 2.17 does not support 3.13).

```bash
# 1. Clone the repository
git clone https://github.com/MuhammadIbrahim732/DL-NLP-Project-Text-Emotion-Analyzer-Frontend-Backend-.git
cd DL-NLP-Project-Text-Emotion-Analyzer-Frontend-Backend-

# 2. Create a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
uvicorn main:app --reload
```

Open **http://127.0.0.1:8000** for the app, or **http://127.0.0.1:8000/docs** for the API docs.

## ☁️ Deploy on Render

**Option A: Blueprint (uses `render.yaml`)**

1. Push the project to GitHub
2. In Render, choose **New → Blueprint** and select the repository
3. Render reads `render.yaml` and deploys automatically

**Option B: Manual Web Service**

| Setting | Value |
|---|---|
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Environment variable | `PYTHON_VERSION = 3.11.9` |
| Health check path | `/health` |

## 🛠️ Tech Stack

| Area | Tools |
|---|---|
| Language | Python |
| Deep learning | TensorFlow, Keras (BiGRU) |
| NLP | Keras Tokenizer, sequence padding |
| Backend | FastAPI, Uvicorn, Pydantic |
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Deployment | Render, GitHub |

## 🔮 Future Improvements

- Compare against LSTM and Transformer (BERT) models
- Add more emotion classes and multi-label detection
- Batch prediction endpoint
- Dockerfile for container deployment
- Model explainability (highlight the words that drove the prediction)

## ⚠️ Limitations

The model is trained on short, first-person emotional sentences. Accuracy can drop on sarcasm, slang, very long text, mixed emotions, or text in other languages.

## 👤 Author

**Muhammad Ibrahim**

- GitHub: [@MuhammadIbrahim732](https://github.com/MuhammadIbrahim732)
- LinkedIn: [muhammad-ibrahim-python](https://www.linkedin.com/in/muhammad-ibrahim-python)

## 📄 License

This project is licensed under the MIT License. Add a `LICENSE` file to the repository if you want this to apply.

---

<div align="center">

⭐ If you found this project useful, please give it a star.

</div>
