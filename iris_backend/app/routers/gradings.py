from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/gradings", tags=["gradings"])


@router.post("/", response_model=schemas.DrGradingOut, status_code=201)
def create_grading(payload: schemas.DrGradingCreate, db: Session = Depends(get_db)):
    """
    Typically called by the MATLAB/inference pipeline once it has
    produced a severity grade for a fundus image — not usually
    called directly from the frontend.
    """
    image = db.query(models.FundusImage).filter(models.FundusImage.id == payload.image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Fundus image not found")

    # referable_flag is derived, not trusted from the caller
    data = payload.model_dump(by_alias=False)
    data["referable_flag"] = data["icdr_level"] >= 2

    grading = models.DrGrading(**data)
    db.add(grading)
    db.commit()
    db.refresh(grading)
    return grading


@router.get("/", response_model=list[schemas.DrGradingOut])
def list_gradings(
    skip: int = 0,
    limit: int = 50,
    image_id: UUID | None = None,
    referable_only: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(models.DrGrading)
    if image_id:
        query = query.filter(models.DrGrading.image_id == image_id)
    if referable_only:
        query = query.filter(models.DrGrading.referable_flag.is_(True))
    return query.order_by(models.DrGrading.graded_at.desc()).offset(skip).limit(limit).all()


@router.get("/{grading_id}", response_model=schemas.DrGradingOut)
def get_grading(grading_id: UUID, db: Session = Depends(get_db)):
    grading = db.query(models.DrGrading).filter(models.DrGrading.id == grading_id).first()
    if not grading:
        raise HTTPException(status_code=404, detail="Grading not found")
    return grading
