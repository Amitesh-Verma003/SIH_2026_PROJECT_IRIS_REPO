"""
SQLAlchemy ORM models mirroring the live Supabase/Postgres schema
(iris_database_schema.sql + migration_001_ground_truth.sql).

Note: `facilities.location` (PostGIS GEOGRAPHY) is intentionally not
mapped here — add the `geoalchemy2` package and a Geography column
type when the team is ready to query on location. Until then it's
still a real column in the DB, just not exposed through the ORM.
"""
import uuid
from sqlalchemy import (
    Column, String, Text, Boolean, SmallInteger, Integer, Numeric,
    TIMESTAMP, Date, ForeignKey, CheckConstraint, UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base


def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())


# ------------------------------------------------------------
# 1. LOOKUP TABLES
# ------------------------------------------------------------

class FacilityType(Base):
    __tablename__ = "facility_types"
    id = Column(SmallInteger, primary_key=True)
    code = Column(Text, unique=True, nullable=False)
    label = Column(Text, nullable=False)
    description = Column(Text)


class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(SmallInteger, primary_key=True)
    code = Column(Text, unique=True, nullable=False)
    label = Column(Text, nullable=False)


class LesionType(Base):
    __tablename__ = "lesion_types"
    id = Column(SmallInteger, primary_key=True)
    code = Column(Text, unique=True, nullable=False)
    label = Column(Text, nullable=False)
    clinical_relevance = Column(Text)


class ReferralStatus(Base):
    __tablename__ = "referral_statuses"
    id = Column(SmallInteger, primary_key=True)
    code = Column(Text, unique=True, nullable=False)
    label = Column(Text, nullable=False)


# ------------------------------------------------------------
# 2. ORGANIZATIONAL STRUCTURE
# ------------------------------------------------------------

class District(Base):
    __tablename__ = "districts"
    id = uuid_pk()
    name = Column(Text, nullable=False)
    state = Column(Text, nullable=False)
    estimated_population = Column(Integer)
    estimated_diabetic_population = Column(Integer)
    ophthalmologist_count = Column(Integer)
    target_annual_screenings = Column(Integer)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Facility(Base):
    __tablename__ = "facilities"
    id = uuid_pk()
    name = Column(Text, nullable=False)
    facility_type_id = Column(SmallInteger, ForeignKey("facility_types.id"), nullable=False)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"), nullable=False)
    address = Column(Text)
    # location GEOGRAPHY(POINT, 4326) — not mapped, see module docstring
    contact_phone = Column(Text)
    contact_email = Column(Text)
    is_active = Column(Boolean, server_default="true")
    metadata_ = Column("metadata", JSONB, server_default="{}")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Device(Base):
    __tablename__ = "devices"
    id = uuid_pk()
    facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"))
    device_model = Column(Text, nullable=False)
    serial_number = Column(Text, unique=True)
    calibration_date = Column(Date)
    status = Column(Text, server_default="active")
    metadata_ = Column("metadata", JSONB, server_default="{}")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


# ------------------------------------------------------------
# 3. PEOPLE
# ------------------------------------------------------------

class User(Base):
    __tablename__ = "users"
    id = uuid_pk()
    facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"))
    role_id = Column(SmallInteger, ForeignKey("user_roles.id"), nullable=False)
    full_name = Column(Text, nullable=False)
    email = Column(Text, unique=True)
    phone = Column(Text)
    license_number = Column(Text)
    is_active = Column(Boolean, server_default="true")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Patient(Base):
    __tablename__ = "patients"
    id = uuid_pk()
    abha_id = Column(Text, unique=True)
    full_name = Column(Text, nullable=False)
    date_of_birth = Column(Date)
    gender = Column(Text)
    phone = Column(Text)
    home_facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"))
    diabetes_diagnosis_date = Column(Date)
    diabetes_type = Column(Text)
    metadata_ = Column("metadata", JSONB, server_default="{}")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))


# ------------------------------------------------------------
# 4. SCREENING WORKFLOW
# ------------------------------------------------------------

class ScreeningSession(Base):
    __tablename__ = "screening_sessions"
    id = uuid_pk()
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"), nullable=False)
    conducted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id"))
    session_date = Column(TIMESTAMP(timezone=True), server_default=func.now())
    status = Column(Text, server_default="in_progress")
    notes = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class FundusImage(Base):
    __tablename__ = "fundus_images"
    id = uuid_pk()
    screening_session_id = Column(UUID(as_uuid=True), ForeignKey("screening_sessions.id"))
    eye = Column(Text)  # 'left' / 'right', nullable for benchmark-dataset images
    storage_path = Column(Text, nullable=False)
    capture_timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now())
    field_of_view_degrees = Column(SmallInteger)
    resolution = Column(Text)
    source_type = Column(Text, nullable=False, server_default="clinical")
    source_dataset = Column(Text)
    source_image_ref = Column(Text)
    metadata_ = Column("metadata", JSONB, server_default="{}")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class ImageQualityAssessment(Base):
    __tablename__ = "image_quality_assessments"
    id = uuid_pk()
    image_id = Column(UUID(as_uuid=True), ForeignKey("fundus_images.id"), nullable=False)
    focus_score = Column(Numeric(4, 3))
    illumination_score = Column(Numeric(4, 3))
    field_of_view_score = Column(Numeric(4, 3))
    overall_quality = Column(Text, nullable=False)  # gradable / borderline / ungradable
    enhancement_applied = Column(JSONB, server_default="[]")
    rejection_reason = Column(Text)
    recapture_requested = Column(Boolean, server_default="false")
    assessed_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


# ------------------------------------------------------------
# 5. AI MODEL TRACEABILITY
# ------------------------------------------------------------

class ModelVersion(Base):
    __tablename__ = "model_versions"
    id = uuid_pk()
    model_name = Column(Text, nullable=False)
    version_number = Column(Text, nullable=False)
    benchmark_dataset = Column(Text)
    reported_sensitivity = Column(Numeric(5, 2))
    reported_specificity = Column(Numeric(5, 2))
    deployed_at = Column(TIMESTAMP(timezone=True))
    is_active = Column(Boolean, server_default="true")
    notes = Column(Text)
    __table_args__ = (UniqueConstraint("model_name", "version_number"),)


# ------------------------------------------------------------
# 6. SEGMENTATION
# ------------------------------------------------------------

class SegmentationResult(Base):
    __tablename__ = "segmentation_results"
    id = uuid_pk()
    image_id = Column(UUID(as_uuid=True), ForeignKey("fundus_images.id"), nullable=False)
    model_version_id = Column(UUID(as_uuid=True), ForeignKey("model_versions.id"))
    lesion_type_id = Column(SmallInteger, ForeignKey("lesion_types.id"), nullable=False)
    bounding_box = Column(JSONB)
    confidence_score = Column(Numeric(4, 3))
    count = Column(Integer)
    metadata_ = Column("metadata", JSONB, server_default="{}")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


# ------------------------------------------------------------
# 7. GRADING & EXPLAINABILITY
# ------------------------------------------------------------

class DrGrading(Base):
    __tablename__ = "dr_gradings"
    id = uuid_pk()
    image_id = Column(UUID(as_uuid=True), ForeignKey("fundus_images.id"), nullable=False)
    model_version_id = Column(UUID(as_uuid=True), ForeignKey("model_versions.id"))
    icdr_level = Column(SmallInteger, nullable=False)
    vtdr_flag = Column(Boolean, server_default="false")
    referable_flag = Column(Boolean, server_default="false")
    confidence_score = Column(Numeric(4, 3))
    graded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    __table_args__ = (CheckConstraint("icdr_level BETWEEN 0 AND 4"),)


class ExplainabilityReport(Base):
    __tablename__ = "explainability_reports"
    id = uuid_pk()
    grading_id = Column(UUID(as_uuid=True), ForeignKey("dr_gradings.id"), nullable=False)
    grad_cam_heatmap_path = Column(Text)
    lesion_evidence = Column(JSONB, server_default="[]")
    report_pdf_path = Column(Text)
    generated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class OphthalmologistReview(Base):
    __tablename__ = "ophthalmologist_reviews"
    id = uuid_pk()
    grading_id = Column(UUID(as_uuid=True), ForeignKey("dr_gradings.id"), nullable=False)
    ophthalmologist_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    agreed_with_ai = Column(Boolean)
    corrected_icdr_level = Column(SmallInteger)
    review_notes = Column(Text)
    review_duration_seconds = Column(Integer)
    reviewed_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    __table_args__ = (CheckConstraint("corrected_icdr_level BETWEEN 0 AND 4"),)


# ------------------------------------------------------------
# 7b. GROUND TRUTH & MODEL VALIDATION
# ------------------------------------------------------------

class GroundTruthAnnotation(Base):
    __tablename__ = "ground_truth_annotations"
    id = uuid_pk()
    image_id = Column(UUID(as_uuid=True), ForeignKey("fundus_images.id"), nullable=False)
    annotator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    external_annotator_label = Column(Text)
    icdr_level = Column(SmallInteger, nullable=False)
    vtdr_flag = Column(Boolean, server_default="false")
    referable_flag = Column(Boolean, server_default="false")
    annotation_source = Column(Text, nullable=False, server_default="expert_panel")
    notes = Column(Text)
    annotated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    __table_args__ = (CheckConstraint("icdr_level BETWEEN 0 AND 4"),)


class GroundTruthConsensus(Base):
    __tablename__ = "ground_truth_consensus"
    id = uuid_pk()
    image_id = Column(UUID(as_uuid=True), ForeignKey("fundus_images.id"), nullable=False, unique=True)
    icdr_level = Column(SmallInteger, nullable=False)
    vtdr_flag = Column(Boolean, server_default="false")
    referable_flag = Column(Boolean, server_default="false")
    adjudication_method = Column(Text)
    finalized_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    __table_args__ = (CheckConstraint("icdr_level BETWEEN 0 AND 4"),)


class GroundTruthLesionAnnotation(Base):
    __tablename__ = "ground_truth_lesion_annotations"
    id = uuid_pk()
    image_id = Column(UUID(as_uuid=True), ForeignKey("fundus_images.id"), nullable=False)
    annotator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    external_annotator_label = Column(Text)
    lesion_type_id = Column(SmallInteger, ForeignKey("lesion_types.id"), nullable=False)
    bounding_box = Column(JSONB, nullable=False)
    notes = Column(Text)
    annotated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class ModelValidationRun(Base):
    __tablename__ = "model_validation_runs"
    id = uuid_pk()
    model_version_id = Column(UUID(as_uuid=True), ForeignKey("model_versions.id"), nullable=False)
    validation_dataset = Column(Text, nullable=False)
    sample_size = Column(Integer, nullable=False)
    sensitivity = Column(Numeric(5, 2))
    specificity = Column(Numeric(5, 2))
    auc_roc = Column(Numeric(5, 4))
    quadratic_weighted_kappa = Column(Numeric(5, 4))
    run_date = Column(TIMESTAMP(timezone=True), server_default=func.now())
    notes = Column(Text)


# ------------------------------------------------------------
# 8. REFERRALS
# ------------------------------------------------------------

class Referral(Base):
    __tablename__ = "referrals"
    id = uuid_pk()
    screening_session_id = Column(UUID(as_uuid=True), ForeignKey("screening_sessions.id"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    urgency_level = Column(Text, server_default="routine")
    referred_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    referred_to_facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"))
    status_id = Column(SmallInteger, ForeignKey("referral_statuses.id"), nullable=False)
    reason = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


# ------------------------------------------------------------
# 9. DISTRICT CAPACITY PLANNING (Simulink integration)
# ------------------------------------------------------------

class CapacitySimulation(Base):
    __tablename__ = "capacity_simulations"
    id = uuid_pk()
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id"), nullable=False)
    simulation_date = Column(Date, server_default=func.current_date())
    target_annual_screenings = Column(Integer)
    modeled_bandwidth_mbps = Column(Numeric(6, 2))
    modeled_throughput_images_per_hour = Column(Numeric(8, 2))
    modeled_review_capacity_per_day = Column(Integer)
    bottleneck_identified = Column(Text)
    recommendations = Column(JSONB, server_default="{}")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


# ------------------------------------------------------------
# 10. AUDIT LOG
# ------------------------------------------------------------

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = uuid_pk()
    entity_type = Column(Text, nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    action = Column(Text, nullable=False)
    performed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    details = Column(JSONB, server_default="{}")
    performed_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
