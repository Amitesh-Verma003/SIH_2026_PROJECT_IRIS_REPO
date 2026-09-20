"""
Pydantic schemas — request/response validation layer, separate
from the SQLAlchemy ORM models in models.py.

Convention used throughout:
  <Entity>Base    -> shared fields
  <Entity>Create  -> fields required to create one (no id/timestamps)
  <Entity>Update  -> all fields optional, for PATCH
  <Entity>Out     -> what the API returns (includes id, timestamps)
"""
from __future__ import annotations
from datetime import datetime, date
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ------------------------------------------------------------
# Lookup tables (read-only from the API's point of view)
# ------------------------------------------------------------

class LookupOut(ORMBase):
    id: int
    code: str
    label: str


# ------------------------------------------------------------
# Districts
# ------------------------------------------------------------

class DistrictBase(BaseModel):
    name: str
    state: str
    estimated_population: Optional[int] = None
    estimated_diabetic_population: Optional[int] = None
    ophthalmologist_count: Optional[int] = None
    target_annual_screenings: Optional[int] = None


class DistrictCreate(DistrictBase):
    pass


class DistrictUpdate(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None
    estimated_population: Optional[int] = None
    estimated_diabetic_population: Optional[int] = None
    ophthalmologist_count: Optional[int] = None
    target_annual_screenings: Optional[int] = None


class DistrictOut(DistrictBase, ORMBase):
    id: UUID
    created_at: datetime
    updated_at: datetime


# ------------------------------------------------------------
# Facilities
# ------------------------------------------------------------

class FacilityBase(BaseModel):
    name: str
    facility_type_id: int
    district_id: UUID
    address: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    is_active: bool = True
    extra_data: dict[str, Any] = Field(default_factory=dict)


class FacilityCreate(FacilityBase):
    pass


class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    facility_type_id: Optional[int] = None
    address: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    is_active: Optional[bool] = None
    extra_data: Optional[dict[str, Any]] = Field(default=None)


class FacilityOut(FacilityBase, ORMBase):
    id: UUID
    created_at: datetime
    updated_at: datetime


# ------------------------------------------------------------
# Devices
# ------------------------------------------------------------

class DeviceBase(BaseModel):
    facility_id: Optional[UUID] = None
    device_model: str
    serial_number: Optional[str] = None
    calibration_date: Optional[date] = None
    status: str = "active"
    extra_data: dict[str, Any] = Field(default_factory=dict)


class DeviceCreate(DeviceBase):
    pass


class DeviceOut(DeviceBase, ORMBase):
    id: UUID
    created_at: datetime


# ------------------------------------------------------------
# Users
# ------------------------------------------------------------

class UserBase(BaseModel):
    facility_id: Optional[UUID] = None
    role_id: int
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    pass


class UserOut(UserBase, ORMBase):
    id: UUID
    created_at: datetime
    updated_at: datetime


# ------------------------------------------------------------
# Patients
# ------------------------------------------------------------

class PatientBase(BaseModel):
    abha_id: Optional[str] = None
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    home_facility_id: Optional[UUID] = None
    diabetes_diagnosis_date: Optional[date] = None
    diabetes_type: Optional[str] = None
    extra_data: dict[str, Any] = Field(default_factory=dict)


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    home_facility_id: Optional[UUID] = None
    diabetes_diagnosis_date: Optional[date] = None
    diabetes_type: Optional[str] = None
    extra_data: Optional[dict[str, Any]] = Field(default=None)


class PatientOut(PatientBase, ORMBase):
    id: UUID
    created_at: datetime
    updated_at: datetime


# ------------------------------------------------------------
# Screening sessions
# ------------------------------------------------------------

class ScreeningSessionBase(BaseModel):
    patient_id: UUID
    facility_id: UUID
    conducted_by: Optional[UUID] = None
    device_id: Optional[UUID] = None
    status: str = "in_progress"
    notes: Optional[str] = None


class ScreeningSessionCreate(ScreeningSessionBase):
    pass


class ScreeningSessionUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class ScreeningSessionOut(ScreeningSessionBase, ORMBase):
    id: UUID
    session_date: datetime
    created_at: datetime
    updated_at: datetime


# ------------------------------------------------------------
# Fundus images
# ------------------------------------------------------------

class FundusImageBase(BaseModel):
    screening_session_id: Optional[UUID] = None
    eye: Optional[str] = None  # 'left' / 'right'
    storage_path: str
    field_of_view_degrees: Optional[int] = None
    resolution: Optional[str] = None
    source_type: str = "clinical"
    source_dataset: Optional[str] = None
    source_image_ref: Optional[str] = None
    extra_data: dict[str, Any] = Field(default_factory=dict)


class FundusImageCreate(FundusImageBase):
    pass


class FundusImageOut(FundusImageBase, ORMBase):
    id: UUID
    capture_timestamp: datetime
    created_at: datetime


# ------------------------------------------------------------
# DR gradings
# ------------------------------------------------------------

class DrGradingBase(BaseModel):
    image_id: UUID
    model_version_id: Optional[UUID] = None
    icdr_level: int = Field(ge=0, le=4)
    vtdr_flag: bool = False
    referable_flag: bool = False
    confidence_score: Optional[float] = None


class DrGradingCreate(DrGradingBase):
    pass


class DrGradingOut(DrGradingBase, ORMBase):
    id: UUID
    graded_at: datetime


# ------------------------------------------------------------
# Referrals
# ------------------------------------------------------------

class ReferralBase(BaseModel):
    screening_session_id: UUID
    patient_id: UUID
    urgency_level: str = "routine"  # routine / urgent / emergency
    referred_to_user_id: Optional[UUID] = None
    referred_to_facility_id: Optional[UUID] = None
    status_id: int
    reason: Optional[str] = None


class ReferralCreate(ReferralBase):
    pass


class ReferralUpdate(BaseModel):
    status_id: Optional[int] = None
    referred_to_user_id: Optional[UUID] = None
    referred_to_facility_id: Optional[UUID] = None
    reason: Optional[str] = None


class ReferralOut(ReferralBase, ORMBase):
    id: UUID
    created_at: datetime
    updated_at: datetime


# ------------------------------------------------------------
# Live Model Prediction Schemas
# ------------------------------------------------------------

class SoftmaxClassItem(BaseModel):
    grade: int
    label: str
    prob: float
    color: str


class IqaResult(BaseModel):
    focus_score: float
    illumination_score: float
    fov_score: float
    overall_status: str
    feedback: str


class GradCamHotspot(BaseModel):
    x: float
    y: float
    r: float
    intensity: float


class GradCamResult(BaseModel):
    hotspots: list[GradCamHotspot] = Field(default_factory=list)
    ai_explanation: str
    heatmap_base64: Optional[str] = None


class LesionEstimate(BaseModel):
    model_config = ConfigDict(extra="allow")
    microaneurysms: Any = 0
    hemorrhages: Any = 0
    hard_exudates: Any = 0
    cotton_wool_spots: Any = 0
    neovascularization: str = "None"
    breakdown: Optional[dict[str, Any]] = None


class GlaucomaNeuroretinalRim(BaseModel):
    rim_disc_ratio: float
    isnt_rule_compliance: str
    vertical_disc_diameter_px: int
    vertical_cup_diameter_px: int


class GlaucomaLandmarks(BaseModel):
    disc_center: dict[str, float]
    disc_radius_pct: float
    cup_center: dict[str, float]
    cup_radius_pct: float
    disc_contour: list[dict[str, float]] = Field(default_factory=list)
    cup_contour: list[dict[str, float]] = Field(default_factory=list)


class GlaucomaResult(BaseModel):
    model_config = ConfigDict(extra="allow")
    model_name: str = "refuge_unet_glaucoma"
    model_version: str = "1.0.0"
    model_architecture: str = "6-Level UNet + Logistic Regression"
    glaucoma_detected: bool
    glaucoma_risk: str
    severity_label: str
    glaucoma_probability: float
    vcdr: float
    hcdr: float
    area_cdr: float
    referable_flag: bool
    urgency_level: str
    badge_color: str
    doctor_recommendation: str
    neuroretinal_rim: Optional[GlaucomaNeuroretinalRim] = None
    landmarks: Optional[GlaucomaLandmarks] = None
    overlay_base64: Optional[str] = None


class GlaucomaAssessmentCreate(BaseModel):
    image_id: UUID
    model_version_id: Optional[UUID] = None
    vcdr: float
    hcdr: Optional[float] = None
    area_cdr: Optional[float] = None
    glaucoma_detected: bool = False
    glaucoma_risk: str
    glaucoma_probability: Optional[float] = None
    referable_flag: bool = False
    urgency_level: str = "LOW"
    badge_color: str = "#10B981"
    rim_disc_ratio: Optional[float] = None
    isnt_rule_compliance: Optional[str] = None
    vertical_disc_diameter_px: Optional[int] = None
    vertical_cup_diameter_px: Optional[int] = None
    landmarks: Optional[dict[str, Any]] = None
    doctor_recommendation: Optional[str] = None
    overlay_base64: Optional[str] = None


class GlaucomaAssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: UUID
    image_id: UUID
    model_version_id: Optional[UUID] = None
    vcdr: float
    hcdr: Optional[float] = None
    area_cdr: Optional[float] = None
    glaucoma_detected: bool
    glaucoma_risk: str
    glaucoma_probability: Optional[float] = None
    referable_flag: bool
    urgency_level: str
    badge_color: str
    rim_disc_ratio: Optional[float] = None
    isnt_rule_compliance: Optional[str] = None
    vertical_disc_diameter_px: Optional[int] = None
    vertical_cup_diameter_px: Optional[int] = None
    landmarks: Optional[dict[str, Any]] = None
    doctor_recommendation: Optional[str] = None
    overlay_base64: Optional[str] = None
    assessed_at: datetime


class DrPredictionOut(BaseModel):
    model_config = ConfigDict(extra="allow")
    model_name: str = "iris_dr_efficientnet_b0"
    model_architecture: str = "EfficientNet-B0"
    model_version: str = "1.0.0"
    icdr_level: int
    grade_label: str
    severity_category: str
    confidence_score: float
    referable_flag: bool
    vtdr_flag: bool
    urgency_level: str
    doctor_recommendation: str
    softmax_distribution: list[SoftmaxClassItem]
    iqa: IqaResult
    grad_cam: GradCamResult
    lesions: dict[str, Any]
    landmarks: Optional[dict[str, Any]] = None
    glaucoma: Optional[GlaucomaResult] = None
    session_id: Optional[UUID] = None
    image_id: Optional[UUID] = None
    grading_id: Optional[UUID] = None
    glaucoma_assessment_id: Optional[UUID] = None
    referral_id: Optional[UUID] = None


class ModelInfoOut(BaseModel):
    model_name: str
    model_architecture: str
    version: str
    num_classes: int
    class_names: list[str]
    image_size: int
    training: dict[str, Any]
    class_distribution: dict[str, int]


class GlaucomaModelInfoOut(BaseModel):
    model_name: str
    model_architecture: str
    version: str
    input_resolution: int
    challenge_dataset: str
    segmentation_targets: list[str]
    classification_metric: str
    clinical_thresholds: dict[str, Any]
    validation_benchmarks: dict[str, Any]


# ------------------------------------------------------------
# Nearest Ophthalmologist & Notification Schemas
# ------------------------------------------------------------

class NearestOphthalmologistOut(BaseModel):
    name: str
    doctor: str
    designation: str
    type: str
    distance: str
    eta: str
    lat: float
    lng: float
    address: str
    phone: str
    emergency_phone: Optional[str] = None
    empanelment: Optional[str] = None
    facilities: list[str] = Field(default_factory=list)
    turnaround_time: Optional[str] = None
    google_maps_url: str


class ReferralNotifyRequest(BaseModel):
    patient_name: str
    patient_id: str
    referral_token: str
    icdr_grade: str
    hospital_name: str
    doctor_name: str
    google_maps_url: str
    contact_phone: Optional[str] = None


class ReferralNotifyResponse(BaseModel):
    status: str
    referral_token: str
    message: str
    dispatched_at: datetime
    google_maps_url: str


# ------------------------------------------------------------
# Simulink PHC Telemetry & Capacity Simulation Schemas
# ------------------------------------------------------------

class PhcNodeTelemetry(BaseModel):
    id: str
    name: str
    district: str
    state: str
    bandwidth_tier: str
    bandwidth_kbps: int
    compression_enabled: bool
    compression_ratio: str
    packet_size_mb: float
    latency_seconds: float
    queue_depth: int
    status: str


class SimulinkTelemetryOut(BaseModel):
    total_screenings_modeled: int
    active_phc_nodes: int
    mean_triage_latency_sec: float
    sla_24h_adherence_pct: float
    bandwidth_saved_tb: float
    compression_ratio: str
    packet_size_compressed_mb: float
    packet_size_raw_mb: float
    phc_nodes: list[PhcNodeTelemetry]


class CapacitySimulationCreate(BaseModel):
    district_id: UUID
    target_annual_screenings: Optional[int] = 100000
    modeled_bandwidth_mbps: Optional[float] = 10.0
    modeled_throughput_images_per_hour: Optional[float] = 45.0
    modeled_review_capacity_per_day: Optional[int] = 250
    bottleneck_identified: Optional[str] = None
    recommendations: Optional[dict[str, Any]] = None
    active_phc_nodes: Optional[int] = 50
    compression_ratio: Optional[str] = "8.4:1"
    bandwidth_saved_tb: Optional[float] = 2.14
    mean_triage_latency_sec: Optional[float] = 22.4
    sla_24h_adherence_pct: Optional[float] = 98.4


class CapacitySimulationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: UUID
    district_id: UUID
    simulation_date: date
    target_annual_screenings: Optional[int] = None
    modeled_bandwidth_mbps: Optional[float] = None
    modeled_throughput_images_per_hour: Optional[float] = None
    modeled_review_capacity_per_day: Optional[int] = None
    bottleneck_identified: Optional[str] = None
    recommendations: Optional[dict[str, Any]] = None
    active_phc_nodes: Optional[int] = None
    compression_ratio: Optional[str] = None
    bandwidth_saved_tb: Optional[float] = None
    mean_triage_latency_sec: Optional[float] = None
    sla_24h_adherence_pct: Optional[float] = None
    created_at: datetime

