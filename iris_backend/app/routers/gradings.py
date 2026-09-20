import base64
import io
import logging
from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, File, Form, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.ml.classifier import get_classifier
from app.ml.glaucoma import get_glaucoma_engine

logger = logging.getLogger("iris.gradings")

router = APIRouter(prefix="/gradings", tags=["gradings"])


@router.get("/model-info", response_model=schemas.ModelInfoOut)
def get_model_information():
    """Returns model architecture, version, training dataset, and validation metrics."""
    try:
        classifier = get_classifier()
        cfg = classifier.config_data or {}
        return schemas.ModelInfoOut(
            model_name=cfg.get("model_name", "iris_dr_efficientnet_b0"),
            model_architecture=cfg.get("model_architecture", "EfficientNet-B0"),
            version=cfg.get("version", "1.0.0"),
            num_classes=cfg.get("num_classes", 5),
            class_names=cfg.get("class_names", [
                "0 - No DR",
                "1 - Mild",
                "2 - Moderate",
                "3 - Severe",
                "4 - Proliferative DR",
            ]),
            image_size=cfg.get("image_size", 224),
            training=cfg.get("training", {
                "dataset": "APTOS 2019 Blindness Detection (part 6)",
                "best_val_qwk": 0.7706,
                "best_val_accuracy": 0.5684,
            }),
            class_distribution=cfg.get("class_distribution", {
                "0 - No DR": 237,
                "1 - Mild": 46,
                "2 - Moderate": 129,
                "3 - Severe": 29,
                "4 - Proliferative DR": 34,
            }),
        )
    except Exception as e:
        logger.error("Failed to fetch model info: %s", e)
        raise HTTPException(status_code=500, detail=f"Model info unavailable: {str(e)}")


@router.get("/glaucoma/model-info", response_model=schemas.GlaucomaModelInfoOut)
def get_glaucoma_model_information():
    """Returns architecture, dataset, segmentation targets, and clinical thresholds for Glaucoma UNet."""
    try:
        return schemas.GlaucomaModelInfoOut(
            model_name="refuge_unet_glaucoma",
            model_architecture="6-Level UNet + Logistic Regression",
            version="1.0.0",
            input_resolution=512,
            challenge_dataset="REFUGE (Retinal Fundus Glaucoma Challenge)",
            segmentation_targets=["Optic Disc (OD)", "Optic Cup (OC)"],
            classification_metric="Vertical Cup-to-Disc Ratio (vCDR)",
            clinical_thresholds={
                "normal_limit": 0.50,
                "borderline_suspect": "0.50 - 0.65",
                "glaucoma_cutoff": 0.65,
                "isnt_rule_eval": "Inferior >= Superior >= Nasal >= Temporal",
            },
            validation_benchmarks={
                "dice_optic_disc": 0.958,
                "dice_optic_cup": 0.884,
                "glaucoma_auc": 0.962,
                "source_challenge": "MICCAI REFUGE 2018/2020",
            },
        )
    except Exception as e:
        logger.error("Failed to fetch glaucoma model info: %s", e)
        raise HTTPException(status_code=500, detail=f"Glaucoma model info unavailable: {str(e)}")


@router.post("/glaucoma/predict", response_model=schemas.GlaucomaResult)
async def predict_glaucoma_image(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    image_id: Optional[UUID] = Form(None),
    save_to_db: bool = Form(False),
    db: Session = Depends(get_db),
):
    """
    Dedicated Glaucoma Optic Disc/Cup Deep Segmentation & Risk Inference Endpoint.
    Accepts fundus image file or base64 data string.
    Returns:
      - Optic disc & optic cup sub-pixel segmentation coordinates
      - Vertical & Horizontal Cup-to-Disc Ratio (vCDR / hCDR)
      - Glaucoma risk probability & clinical referral tier
      - Colorized segmentation overlay mask PNG (base64)
    Optionally persists assessment record in PostgreSQL if save_to_db=true and image_id is given.
    """
    image_data: Optional[bytes] = None

    if file is not None:
        image_data = await file.read()
    elif image_base64:
        b64_str = image_base64
        if "," in b64_str:
            b64_str = b64_str.split(",", 1)[1]
        try:
            image_data = base64.b64decode(b64_str)
        except Exception as err:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {err}")

    if not image_data:
        raise HTTPException(
            status_code=400,
            detail="No retinal image provided. Please supply 'file' (multipart) or 'image_base64' (string).",
        )

    try:
        pil_image = Image.open(io.BytesIO(image_data))
    except Exception as err:
        raise HTTPException(status_code=400, detail=f"Failed to decode image file: {err}")

    try:
        engine = get_glaucoma_engine()
        gl_result = engine.analyze(pil_image)

        if save_to_db and image_id and db:
            try:
                rim = gl_result.get("neuroretinal_rim") or {}
                glaucoma_rec = models.GlaucomaAssessment(
                    image_id=image_id,
                    vcdr=gl_result.get("vcdr", 0.38),
                    hcdr=gl_result.get("hcdr"),
                    area_cdr=gl_result.get("area_cdr"),
                    glaucoma_detected=gl_result.get("glaucoma_detected", False),
                    glaucoma_risk=gl_result.get("glaucoma_risk", "Normal / Low Risk"),
                    glaucoma_probability=gl_result.get("glaucoma_probability"),
                    referable_flag=gl_result.get("referable_flag", False),
                    urgency_level=gl_result.get("urgency_level", "LOW"),
                    badge_color=gl_result.get("badge_color", "#10B981"),
                    rim_disc_ratio=rim.get("rim_disc_ratio"),
                    isnt_rule_compliance=rim.get("isnt_rule_compliance"),
                    vertical_disc_diameter_px=rim.get("vertical_disc_diameter_px"),
                    vertical_cup_diameter_px=rim.get("vertical_cup_diameter_px"),
                    landmarks=gl_result.get("landmarks") or {},
                    doctor_recommendation=gl_result.get("doctor_recommendation"),
                    overlay_base64=gl_result.get("overlay_base64"),
                )
                db.add(glaucoma_rec)
                db.commit()
            except Exception as db_err:
                logger.warning("Failed to save standalone glaucoma assessment: %s", db_err)
                db.rollback()

        return gl_result
    except Exception as err:
        logger.exception("Glaucoma inference failure: %s", err)
        raise HTTPException(status_code=500, detail=f"Glaucoma analysis failed: {str(err)}")


@router.get("/glaucoma", response_model=list[schemas.GlaucomaAssessmentOut])
def list_glaucoma_assessments(
    skip: int = 0,
    limit: int = 50,
    image_id: Optional[UUID] = None,
    referable_only: bool = False,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List historical glaucoma assessments with optional filtering."""
    query = db.query(models.GlaucomaAssessment)
    if image_id:
        query = query.filter(models.GlaucomaAssessment.image_id == image_id)
    if referable_only:
        query = query.filter(models.GlaucomaAssessment.referable_flag.is_(True))
    if risk_level:
        query = query.filter(models.GlaucomaAssessment.glaucoma_risk.ilike(f"%{risk_level}%"))
    return (
        query.order_by(models.GlaucomaAssessment.assessed_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/glaucoma/{assessment_id}", response_model=schemas.GlaucomaAssessmentOut)
def get_glaucoma_assessment(assessment_id: UUID, db: Session = Depends(get_db)):
    """Fetch single glaucoma assessment including optic disc/cup contours."""
    rec = db.query(models.GlaucomaAssessment).filter(models.GlaucomaAssessment.id == assessment_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Glaucoma assessment not found")
    return rec


@router.post("/predict", response_model=schemas.DrPredictionOut)
async def predict_retinal_image(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    patient_id: Optional[UUID] = Form(None),
    facility_id: Optional[UUID] = Form(None),
    screening_session_id: Optional[UUID] = Form(None),
    save_to_db: bool = Form(False),
    eye: str = Form("right"),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Live AI Diabetic Retinopathy Diagnostic Inference Endpoint.
    Accepts either an uploaded retinal image file or base64 data string.
    Runs the trained EfficientNet-B0 PyTorch model and returns:
      - 5-class ICDR severity probability spread
      - Maximum softmax confidence
      - Grad-CAM heatmap localization coordinates
      - Automated Image Quality Assessment (IQA)
      - Tele-ophthalmology triage & referral recommendation
    Optionally persists the session, image record, and grading in PostgreSQL.
    """
    image_data: Optional[bytes] = None

    if file is not None:
        image_data = await file.read()
    elif image_base64:
        # Strip data:image/...;base64, header if present
        b64_str = image_base64
        if "," in b64_str:
            b64_str = b64_str.split(",", 1)[1]
        try:
            image_data = base64.b64decode(b64_str)
        except Exception as err:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {err}")

    if not image_data:
        raise HTTPException(
            status_code=400,
            detail="No retinal image provided. Please supply 'file' (multipart) or 'image_base64' (string).",
        )

    # Decode image via PIL
    try:
        pil_image = Image.open(io.BytesIO(image_data))
    except Exception as err:
        raise HTTPException(status_code=400, detail=f"Failed to decode image file: {err}")

    # Run trained model inference
    try:
        classifier = get_classifier()
        prediction = classifier.predict(pil_image)
    except ValueError as val_err:
        if "not the image of retina" in str(val_err):
            logger.warning("Non-retinal image rejected: %s", val_err)
            raise HTTPException(status_code=400, detail="not the image of retina")
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as err:
        logger.exception("Inference execution failure: %s", err)
        raise HTTPException(status_code=500, detail=f"Model inference failed: {str(err)}")

    # Database persistence if requested and credentials are valid
    created_session_id = screening_session_id
    created_image_id = None
    created_grading_id = None
    created_referral_id = None

    if save_to_db and db:
        try:
            # 1. Create or verify screening session
            if not created_session_id and patient_id and facility_id:
                session = models.ScreeningSession(
                    patient_id=patient_id,
                    facility_id=facility_id,
                    status="completed",
                    notes=notes or "AI Model Inference via IRIS Studio",
                )
                db.add(session)
                db.flush()
                created_session_id = session.id

            # 2. Add fundus image record
            if created_session_id:
                storage_filename = (
                    file.filename
                    if (file and file.filename)
                    else f"capture_{prediction['icdr_level']}.jpg"
                )
                fundus_img = models.FundusImage(
                    screening_session_id=created_session_id,
                    eye="right" if "right" in eye.lower() or "od" in eye.lower() else "left",
                    storage_path=f"retina://live_inference/{storage_filename}",
                    source_type="clinical_upload",
                    field_of_view_degrees=45,
                    resolution=f"{pil_image.width}x{pil_image.height}",
                )
                db.add(fundus_img)
                db.flush()
                created_image_id = fundus_img.id

                # 3. Create GlaucomaAssessment record if glaucoma analysis is present
                created_glaucoma_id = None
                gl_data = prediction.get("glaucoma")
                if gl_data:
                    rim = gl_data.get("neuroretinal_rim") or {}
                    glaucoma_rec = models.GlaucomaAssessment(
                        image_id=fundus_img.id,
                        vcdr=gl_data.get("vcdr", 0.38),
                        hcdr=gl_data.get("hcdr"),
                        area_cdr=gl_data.get("area_cdr"),
                        glaucoma_detected=gl_data.get("glaucoma_detected", False),
                        glaucoma_risk=gl_data.get("glaucoma_risk", "Normal / Low Risk"),
                        glaucoma_probability=gl_data.get("glaucoma_probability"),
                        referable_flag=gl_data.get("referable_flag", False),
                        urgency_level=gl_data.get("urgency_level", "LOW"),
                        badge_color=gl_data.get("badge_color", "#10B981"),
                        rim_disc_ratio=rim.get("rim_disc_ratio"),
                        isnt_rule_compliance=rim.get("isnt_rule_compliance"),
                        vertical_disc_diameter_px=rim.get("vertical_disc_diameter_px"),
                        vertical_cup_diameter_px=rim.get("vertical_cup_diameter_px"),
                        landmarks=gl_data.get("landmarks") or {},
                        doctor_recommendation=gl_data.get("doctor_recommendation"),
                        overlay_base64=gl_data.get("overlay_base64"),
                    )
                    db.add(glaucoma_rec)
                    db.flush()
                    created_glaucoma_id = glaucoma_rec.id

                # 4. Create DrGrading record
                grading = models.DrGrading(
                    image_id=fundus_img.id,
                    glaucoma_assessment_id=created_glaucoma_id,
                    icdr_level=prediction["icdr_level"],
                    vtdr_flag=prediction["vtdr_flag"],
                    referable_flag=prediction["referable_flag"],
                    confidence_score=round(prediction["confidence_score"] / 100.0, 4),
                )
                db.add(grading)
                db.flush()
                created_grading_id = grading.id

                # 5. If referable (DR or Glaucoma), create referral record
                is_referable = prediction["referable_flag"] or (gl_data and gl_data.get("referable_flag", False))
                if is_referable and patient_id:
                    referral_urgency = (
                        "emergency"
                        if prediction["icdr_level"] >= 4
                        else "urgent"
                        if prediction["icdr_level"] >= 3 or (gl_data and gl_data.get("urgency_level") == "HIGH")
                        else "routine"
                    )
                    referral = models.Referral(
                        screening_session_id=created_session_id,
                        patient_id=patient_id,
                        urgency_level=referral_urgency,
                        status_id=1,  # pending
                        reason=prediction["doctor_recommendation"],
                    )
                    db.add(referral)
                    db.flush()
                    created_referral_id = referral.id

                db.commit()
        except Exception as db_err:
            logger.warning("Database persistence skipped due to: %s", db_err)
            db.rollback()

    prediction["session_id"] = created_session_id
    prediction["image_id"] = created_image_id
    prediction["grading_id"] = created_grading_id
    prediction["glaucoma_assessment_id"] = created_glaucoma_id if "created_glaucoma_id" in locals() else None
    prediction["referral_id"] = created_referral_id

    return prediction


@router.post("/", response_model=schemas.DrGradingOut, status_code=201)
def create_grading(payload: schemas.DrGradingCreate, db: Session = Depends(get_db)):
    """
    Standard CRUD endpoint for recording a severity grade for an existing fundus image.
    """
    image = db.query(models.FundusImage).filter(models.FundusImage.id == payload.image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Fundus image not found")

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

