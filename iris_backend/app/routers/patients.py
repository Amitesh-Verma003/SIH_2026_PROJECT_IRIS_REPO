from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/patients", tags=["patients"])


@router.post("/", response_model=schemas.PatientOut, status_code=201)
def create_patient(payload: schemas.PatientCreate, db: Session = Depends(get_db)):
    if payload.abha_id:
        existing = db.query(models.Patient).filter(
            models.Patient.abha_id == payload.abha_id,
            models.Patient.deleted_at.is_(None)
        ).first()
        if existing:
            for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
                if value is not None:
                    setattr(existing, field, value)
            db.commit()
            db.refresh(existing)
            return existing

    patient = models.Patient(**payload.model_dump(by_alias=False))
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/", response_model=list[schemas.PatientOut])
def list_patients(
    skip: int = 0,
    limit: int = 50,
    facility_id: UUID | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Patient).filter(models.Patient.deleted_at.is_(None))
    if facility_id:
        query = query.filter(models.Patient.home_facility_id == facility_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(patient_id: UUID, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id, models.Patient.deleted_at.is_(None)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.patch("/{patient_id}", response_model=schemas.PatientOut)
def update_patient(patient_id: UUID, payload: schemas.PatientUpdate, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=204)
def soft_delete_patient(patient_id: UUID, db: Session = Depends(get_db)):
    """Soft delete — sets deleted_at rather than removing the row,
    since screening history must remain intact for audit purposes."""
    from sqlalchemy import func
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.deleted_at = func.now()
    db.commit()
    return None
