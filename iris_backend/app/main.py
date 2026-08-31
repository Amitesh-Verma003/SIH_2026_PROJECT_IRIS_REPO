from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import settings
from app.database import engine, get_db
from app.routers import patients, facilities, screenings, gradings, referrals, lookups
from app import models

# Ensure database tables exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, debug=settings.debug)

# Loosened for early development — tighten to your actual frontend
# origin(s) before this goes anywhere near a real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# All routers mounted under /api prefix
app.include_router(patients.router, prefix="/api")
app.include_router(facilities.router, prefix="/api")
app.include_router(screenings.router, prefix="/api")
app.include_router(gradings.router, prefix="/api")
app.include_router(referrals.router, prefix="/api")
app.include_router(lookups.router, prefix="/api")


@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.app_name,
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.app_name}


@app.get("/api/stats/dashboard")
def dashboard_stats(db: Session = Depends(get_db)):
    """Aggregate counts for the frontend dashboard hero section."""
    total_patients = db.query(func.count(models.Patient.id)).filter(
        models.Patient.deleted_at.is_(None)
    ).scalar() or 0

    total_screenings = db.query(func.count(models.ScreeningSession.id)).scalar() or 0

    total_gradings = db.query(func.count(models.DrGrading.id)).scalar() or 0

    referable_count = db.query(func.count(models.DrGrading.id)).filter(
        models.DrGrading.referable_flag.is_(True)
    ).scalar() or 0

    total_referrals = db.query(func.count(models.Referral.id)).scalar() or 0

    total_facilities = db.query(func.count(models.Facility.id)).filter(
        models.Facility.is_active.is_(True)
    ).scalar() or 0

    return {
        "total_patients": total_patients,
        "total_screenings": total_screenings,
        "total_gradings": total_gradings,
        "referable_count": referable_count,
        "total_referrals": total_referrals,
        "total_facilities": total_facilities,
    }
