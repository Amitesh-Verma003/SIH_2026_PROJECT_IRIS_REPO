"""
Read-only endpoints for the lookup tables — lets the frontend
populate dropdowns (facility type, lesion type, referral status,
user role) without hard-coding the values on the client.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/lookups", tags=["lookups"])


@router.get("/facility-types", response_model=list[schemas.LookupOut])
def get_facility_types(db: Session = Depends(get_db)):
    return db.query(models.FacilityType).all()


@router.get("/user-roles", response_model=list[schemas.LookupOut])
def get_user_roles(db: Session = Depends(get_db)):
    return db.query(models.UserRole).all()


@router.get("/lesion-types", response_model=list[schemas.LookupOut])
def get_lesion_types(db: Session = Depends(get_db)):
    return db.query(models.LesionType).all()


@router.get("/referral-statuses", response_model=list[schemas.LookupOut])
def get_referral_statuses(db: Session = Depends(get_db)):
    return db.query(models.ReferralStatus).all()
