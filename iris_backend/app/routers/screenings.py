from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/screenings", tags=["screenings"])


# ------------------------------------------------------------
# Screening sessions
# ------------------------------------------------------------

@router.post("/", response_model=schemas.ScreeningSessionOut, status_code=201)
def create_screening_session(payload: schemas.ScreeningSessionCreate, db: Session = Depends(get_db)):
    session = models.ScreeningSession(**payload.model_dump(by_alias=False))
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=list[schemas.ScreeningSessionOut])
def list_screening_sessions(
    skip: int = 0,
    limit: int = 50,
    patient_id: UUID | None = None,
    facility_id: UUID | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.ScreeningSession)
    if patient_id:
        query = query.filter(models.ScreeningSession.patient_id == patient_id)
    if facility_id:
        query = query.filter(models.ScreeningSession.facility_id == facility_id)
    if status:
        query = query.filter(models.ScreeningSession.status == status)
    return query.order_by(models.ScreeningSession.session_date.desc()).offset(skip).limit(limit).all()


@router.get("/{session_id}", response_model=schemas.ScreeningSessionOut)
def get_screening_session(session_id: UUID, db: Session = Depends(get_db)):
    session = db.query(models.ScreeningSession).filter(models.ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening session not found")
    return session


@router.patch("/{session_id}", response_model=schemas.ScreeningSessionOut)
def update_screening_session(
    session_id: UUID, payload: schemas.ScreeningSessionUpdate, db: Session = Depends(get_db)
):
    session = db.query(models.ScreeningSession).filter(models.ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening session not found")
    for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
        setattr(session, field, value)
    db.commit()
    db.refresh(session)
    return session


# ------------------------------------------------------------
# Fundus images (nested under a screening session, or standalone
# for benchmark-dataset images per source_type="benchmark_dataset")
# ------------------------------------------------------------

@router.post("/{session_id}/images", response_model=schemas.FundusImageOut, status_code=201)
def add_fundus_image(session_id: UUID, payload: schemas.FundusImageCreate, db: Session = Depends(get_db)):
    session = db.query(models.ScreeningSession).filter(models.ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening session not found")
    image = models.FundusImage(**payload.model_dump(by_alias=False), screening_session_id=session_id)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.get("/{session_id}/images", response_model=list[schemas.FundusImageOut])
def list_images_for_session(session_id: UUID, db: Session = Depends(get_db)):
    return db.query(models.FundusImage).filter(
        models.FundusImage.screening_session_id == session_id
    ).all()
