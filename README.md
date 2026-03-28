<!-- # React + Vite

Smart Color is integrated with your final-year-project API contract.

## Frontend

```bash
npm install
npm run dev
```

## Use your existing backend (`final year project`)

Start backend from the folder that contains `api_server.py`:

```bash
uvicorn api_server:app --reload
```

Smart Color page calls by default:

`http://127.0.0.1:8000/generate-palette`

This matches your zip `index.html` flow (`industry`, `emotion` query params).

You can change endpoint from the Smart Color UI input or via env:

- `VITE_COLOR_API_URL`

## Optional CNN API in this repo

A separate local API is also included at:

`backend/cnn_color_api.py`

Use it only if you want direct image upload inference from this repo. -->



# AI Smart UI — Final Year Project

AI-powered colour and layout recommendation system built with React + Vite.
Uses a CNN for colour generation and MobileNetV3-Large for layout prediction.

---

## Quick Start (Run Everything)

You need **3 terminals** open at the same time.

### Terminal 1 — React Frontend
```bash
cd ai-smart-ui
npm install
npm run dev
```
Opens at: `http://localhost:5173`

### Terminal 2 — Colour Generation Backend (CNN)
```bash
cd your-fyp-folder
uvicorn api_server:app --reload
```
Runs at: `http://127.0.0.1:8000`

### Terminal 3 — Layout Generation Backend (MobileNetV3)
```bash
cd ai-smart-ui-backend
python -m venv venv

# Activate virtual environment:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
Runs at: `http://localhost:5000`

---

## Project Structure

```
ai-smart-ui/                  ← React frontend
│
├── src/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Workspace.jsx
│   │   ├── SmartColor.jsx        ← calls CNN colour API
│   │   └── LayoutGenerator.jsx   ← calls MobileNetV3 layout API
│   │
│   ├── components/
│   │   ├── DashboardMock.jsx
│   │   ├── PhoneMock.jsx
│   │   ├── LandingMock.jsx
│   │   ├── NavBar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   └── utils/
│       ├── colorGen.js           ← client-side colour math
│       ├── layoutGen.js          ← rule-based fallback
│       ├── layoutAI.js           ← MobileNetV3 API caller
│       ├── landingAI.js          ← landing page generator
│       └── auth.js               ← localStorage auth
│
ai-smart-ui-backend/          ← MobileNetV3 Flask backend
│
├── app.py                    ← Flask server + MobileNetV3 model
├── requirements.txt
└── README.md

your-fyp-folder/              ← CNN colour backend (your existing project)
│
├── api_server.py             ← FastAPI server
└── backend/
    └── cnn_color_api.py      ← optional direct image inference
```

---

## Feature 1 — Smart Colour Generation (CNN)

### How It Works
The Smart Color page sends the user's inputs to your existing CNN backend
and receives a recommended colour palette in response.

### API Endpoint
```
POST http://127.0.0.1:8000/generate-palette
```

Query parameters:
- `industry` — e.g. fintech, healthcare, ecommerce
- `emotion`  — e.g. professional, playful, minimalist

### Changing the Endpoint
You can change the API URL from the Smart Color UI input field,
or set it via environment variable before running the frontend:

```bash
VITE_COLOR_API_URL=http://127.0.0.1:8000/generate-palette
```

### Optional CNN API (included in this repo)
A separate local API is also included at:
```
backend/cnn_color_api.py
```
Use this only if you want direct image upload inference from this repo
instead of your existing `api_server.py`.

---

## Feature 2 — Layout Generation (MobileNetV3)

### How It Works

```
User types prompt
       │
       ▼
React Frontend (LayoutGenerator.jsx)
       │
       │  POST /predict/layout
       │  { prompt, mode, seed }
       ▼
Flask Backend (app.py)
       │
       ├─ prompt_to_feature_image()
       │    Converts text prompt into a 128x128 RGB image
       │    Domain keywords  → base hue
       │    Emotion keywords → saturation
       │    Mode             → brightness + structural pattern
       │
       ├─ MobileNetV3-Large
       │    Pretrained on ImageNet
       │    Custom head: Linear(960→256) → Hardswish → Dropout → Linear(256→15)
       │    Predicts one of 15 layout categories
       │
       ├─ Mode filter
       │    Only considers categories matching the requested mode
       │
       └─ Returns: category + confidence + template_hints
               │
               ▼
       React renders DashboardMock / PhoneMock / LandingMock
       using the AI-predicted template hints
```

### Why MobileNetV3
MobileNetV3-Large was selected over Vision Transformers, GNNs, and
diffusion models because of its:
- Low computational cost
- Fast inference time (milliseconds on CPU)
- Small memory footprint
- No GPU required

### Layout Categories (15 classes)

| Category              | Mode      | Renders As          |
|-----------------------|-----------|---------------------|
| dashboard_minimal     | Dashboard | Minimal dashboard   |
| dashboard_finance     | Dashboard | Finance dashboard   |
| dashboard_fitness     | Dashboard | Fitness dashboard   |
| dashboard_analytics   | Dashboard | Analytics dashboard |
| dashboard_logistics   | Dashboard | Logistics dashboard |
| dashboard_skills      | Dashboard | Skills/edu dashboard|
| mobile_ecommerce      | Mobile    | Ecommerce screens   |
| mobile_fitness        | Mobile    | Fitness screens     |
| mobile_fintech        | Mobile    | Fintech screens     |
| mobile_general        | Mobile    | General screens     |
| landing_centered      | Landing   | Centered hero       |
| landing_image_right   | Landing   | Image right hero    |
| landing_phone_hero    | Landing   | Phone hero          |
| landing_search_hero   | Landing   | Search bar hero     |
| landing_split         | Landing   | Split hero + stats  |

### Fallback Behaviour
If the Flask backend is not running, the React frontend automatically
falls back to the original rule-based algorithm (layoutGen.js).

The UI shows:
- 🟢 Green dot = MobileNetV3 backend online
- 🔴 Red dot   = Backend offline, using rule-based fallback

---

## Layout API Reference

### GET /health
Check if the layout backend is running.

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "model": "MobileNetV3-Large",
  "device": "cpu",
  "num_categories": 15,
  "categories": ["dashboard_minimal", "dashboard_finance", "..."]
}
```

---

### POST /predict/layout
Predict a layout category from a text prompt.

Request:
```json
{
  "prompt": "A modern fintech mobile app, clean and minimal",
  "mode": "mobile",
  "seed": 1
}
```

Response:
```json
{
  "category": "mobile_fintech",
  "confidence": 0.7823,
  "domain": "fintech",
  "model_version": "MobileNetV3-Large",
  "source": "mobilenetv3",
  "all_scores": {
    "mobile_fintech": 0.7823,
    "mobile_fitness": 0.1204
  },
  "template_hints": {
    "screens": ["Dashboard", "Wallet", "Transactions", "Cards", "Analytics", "Profile"],
    "nav": "tab"
  }
}
```

---

### POST /predict/batch
Predict layouts for multiple prompts at once (max 10).

Request:
```json
{
  "items": [
    { "prompt": "fintech app",  "mode": "mobile",    "seed": 1 },
    { "prompt": "analytics",    "mode": "dashboard", "seed": 2 }
  ]
}
```

---

## How Prompt Encoding Works

Since MobileNetV3 expects an image input, the text prompt is converted
to a 128x128 RGB image before being passed to the model:

```
"fintech mobile app dark minimal"
         │
         ▼
Domain detection:  "fintech" → hue = 260 (blue-purple)
Emotion detection: "minimal" → saturation = 80
Mode:              "mobile"  → brightness = 140
         │
         ▼
128x128 RGB image:
  - Base fill:    HSV(260, 80, 140) converted to RGB
  - Top band:     Lighter (represents navigation area)
  - Left band:    Darker  (sidebar, dashboard only)
  - Content area: Lighter region
  - Noise:        Seed-based random variation
         │
         ▼
MobileNetV3-Large processes the image
and outputs a probability distribution
over 15 layout categories
```

---

## Training the Model (Optional)

The model currently uses pretrained ImageNet weights.
To fine-tune it on real UI data:

**Step 1** — Collect screenshots of UIs in each category (minimum 200 per class)

**Step 2** — Train with cross-entropy loss:
```python
optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
criterion = nn.CrossEntropyLoss()

for epoch in range(50):
    correct = 0
    total = 0
    for images, labels in dataloader:
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    acc = correct / total
    print(f"Epoch {epoch}: Loss={loss.item():.4f} Accuracy={acc:.4f}")

torch.save(model.state_dict(), "model/layout_classifier.pth")
```

**Optional evaluation metrics (after each epoch or on validation set):**
```python
from sklearn.metrics import classification_report, confusion_matrix

all_preds = []
all_labels = []
with torch.no_grad():
    for images, labels in val_loader:
        outputs = model(images)
        _, preds = torch.max(outputs, 1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

print(confusion_matrix(all_labels, all_preds))
print(classification_report(all_labels, all_preds, digits=4))
```

**Step 3** — Load saved weights in `app.py`:
```python
model.load_state_dict(torch.load("model/layout_classifier.pth"))
```

---

## What to Write in Your Documentation

### Colour Generation
> The colour generation system uses a Convolutional Neural Network (CNN)
> that takes industry and emotion as inputs and recommends harmonious
> colour palettes. The model is served via a FastAPI backend
> (`api_server.py`) and called from the Smart Color page in the
> React frontend.

### Layout Generation
> The layout generation system uses MobileNetV3-Large, a lightweight
> convolutional neural network originally designed for mobile inference.
> Text prompts are encoded into structured 128×128 RGB feature images
> using domain and emotion keyword analysis, which are then processed
> by the MobileNetV3 feature extractor. The network's classifier head
> (Linear → Hardswish → Dropout → Linear) predicts one of 15 layout
> categories. Template configuration hints are derived from the predicted
> category and passed to the React rendering components. A rule-based
> fallback ensures the system remains functional when the AI backend
> is unavailable.

### Model Choice Justification
> MobileNetV3-Large was selected over Vision Transformers, GNNs, and
> diffusion models due to its low computational cost, fast inference
> time (milliseconds on CPU), and small memory footprint — making it
> suitable for real-time layout prediction without requiring GPU hardware.
