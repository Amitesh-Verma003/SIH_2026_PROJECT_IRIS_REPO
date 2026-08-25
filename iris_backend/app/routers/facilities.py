from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/facilities", tags=["facilities"])


@router.post("/", response_model=schemas.FacilityOut, status_code=201)
def create_facility(payload: schemas.FacilityCreate, db: Session = Depends(get_db)):
    facility = models.Facility(**payload.model_dump(by_alias=False))
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


@router.get("/", response_model=list[schemas.FacilityOut])
def list_facilities(
    skip: int = 0,
    limit: int = 50,
    district_id: UUID | None = None,
    is_active: bool | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Facility)
    if district_id:
        query = query.filter(models.Facility.district_id == district_id)
    if is_active is not None:
        query = query.filter(models.Facility.is_active == is_active)
    return query.offset(skip).limit(limit).all()


@router.get("/{facility_id}", response_model=schemas.FacilityOut)
def get_facility(facility_id: UUID, db: Session = Depends(get_db)):
    facility = db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    return facility


@router.patch("/{facility_id}", response_model=schemas.FacilityOut)
def update_facility(facility_id: UUID, payload: schemas.FacilityUpdate, db: Session = Depends(get_db)):
    facility = db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
        setattr(facility, field, value)
    db.commit()
    db.refresh(facility)
    return facility
