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
    microaneurysms: int = 0
    hemorrhages: int = 0
    hard_exudates: int = 0
    cotton_wool_spots: int = 0
    neovascularization: str = "None"


class DrPredictionOut(BaseModel):
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
    lesions: LesionEstimate
    session_id: Optional[UUID] = None
    image_id: Optional[UUID] = None
    grading_id: Optional[UUID] = None
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

