from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from context_palette import generate_context_palette_from_image

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "API running"}

@app.get("/generate-palette")
def generate_palette(industry: str, emotion: str):
    result = generate_context_palette_from_image(
        image_path="ui_images/Screenshot_20251228-235438.jpg",
        industry=industry,
        emotion=emotion,
        K=5,
        device="cpu"
    )
    return result
