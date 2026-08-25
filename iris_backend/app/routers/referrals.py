from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/referrals", tags=["referrals"])


@router.post("/", response_model=schemas.ReferralOut, status_code=201)
def create_referral(payload: schemas.ReferralCreate, db: Session = Depends(get_db)):
    referral = models.Referral(**payload.model_dump(by_alias=False))
    db.add(referral)
    db.commit()
    db.refresh(referral)
    return referral


@router.get("/", response_model=list[schemas.ReferralOut])
def list_referrals(
    skip: int = 0,
    limit: int = 50,
    patient_id: UUID | None = None,
    status_id: int | None = None,
    urgency_level: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Referral)
    if patient_id:
        query = query.filter(models.Referral.patient_id == patient_id)
    if status_id:
        query = query.filter(models.Referral.status_id == status_id)
    if urgency_level:
        query = query.filter(models.Referral.urgency_level == urgency_level)
    # Surface urgent/emergency cases first — matches the VTDR-priority
    # referral queue described in the project's two-tier detection logic
    return query.order_by(
        models.Referral.urgency_level.desc(), models.Referral.created_at.asc()
    ).offset(skip).limit(limit).all()


@router.get("/{referral_id}", response_model=schemas.ReferralOut)
def get_referral(referral_id: UUID, db: Session = Depends(get_db)):
    referral = db.query(models.Referral).filter(models.Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    return referral


@router.patch("/{referral_id}", response_model=schemas.ReferralOut)
def update_referral(referral_id: UUID, payload: schemas.ReferralUpdate, db: Session = Depends(get_db)):
    referral = db.query(models.Referral).filter(models.Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
        setattr(referral, field, value)
    db.commit()
    db.refresh(referral)
    return referral
