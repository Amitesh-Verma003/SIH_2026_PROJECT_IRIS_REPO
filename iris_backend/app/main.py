from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import patients, facilities, screenings, gradings, referrals, lookups

app = FastAPI(title=settings.app_name, debug=settings.debug)

# Loosened for early development — tighten to your actual frontend
# origin(s) before this goes anywhere near a real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(facilities.router)
app.include_router(screenings.router)
app.include_router(gradings.router)
app.include_router(referrals.router)
app.include_router(lookups.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.app_name}
