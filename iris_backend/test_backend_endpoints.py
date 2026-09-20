"""
IRIS AI — End-to-End Backend Verification Suite
===============================================
Tests:
  1. DB Table creation (glaucoma_assessments, dr_gradings link, capacity_simulations)
  2. Glaucoma model-info and standalone inference endpoints
  3. DR predict pipeline with save_to_db=True (DR + Glaucoma unified persistence)
  4. Querying saved GlaucomaAssessment by ID and by list filter
  5. Nearest Ophthalmologist lookup & notification dispatch
  6. Simulink Telemetry Hub (50 PHC nodes, 8.4:1 Wavelet compression toggle)
  7. Dashboard statistics
"""

import sys
from pathlib import Path
import io
import uuid

# Set UTF-8 encoding on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from PIL import Image, ImageDraw
from fastapi.testclient import TestClient

from app.main import app
from app.database import engine, Base
from app import models

client = TestClient(app)


def create_synthetic_fundus_image() -> bytes:
    """Generates an in-memory PNG retinal fundus image for upload testing."""
    img = Image.new("RGB", (224, 224), color=(30, 8, 4))
    draw = ImageDraw.Draw(img)
    # Retinal disc
    draw.ellipse([8, 8, 216, 216], fill=(180, 50, 20), outline=(120, 30, 10))
    # Optic disc
    draw.ellipse([50, 90, 85, 125], fill=(255, 230, 140))
    # Macula
    draw.ellipse([130, 95, 160, 125], fill=(120, 25, 10))
    # Vessels
    draw.line([(68, 107), (110, 50), (170, 40)], fill=(80, 10, 10), width=3)
    draw.line([(68, 107), (115, 160), (175, 180)], fill=(80, 10, 10), width=3)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def run_tests():
    print("=" * 65)
    print("      IRIS AI BACKEND & DATABASE INTEGRATION VERIFICATION")
    print("=" * 65)

    # 1. Verify Database Schema Creation
    print("\n[1/7] Ensuring SQLite / Postgres Tables Created...")
    Base.metadata.create_all(bind=engine)
    print("      [OK] Base.metadata.create_all completed successfully.")

    # 2. Health & Dashboard Stats
    print("\n[2/7] Testing Health & Dashboard Stats Endpoints...")
    res_health = client.get("/api/health")
    assert res_health.status_code == 200, f"Health check failed: {res_health.text}"
    print(f"      [OK] Health Check: {res_health.json()}")

    res_stats = client.get("/api/stats/dashboard")
    assert res_stats.status_code == 200, f"Stats failed: {res_stats.text}"
    stats_data = res_stats.json()
    print(f"      [OK] Dashboard Stats: {stats_data}")

    # 3. Glaucoma Model Info Endpoint
    print("\n[3/7] Testing Glaucoma Model Info Endpoint...")
    res_gl_info = client.get("/api/gradings/glaucoma/model-info")
    assert res_gl_info.status_code == 200, f"Glaucoma model info failed: {res_gl_info.text}"
    gl_info = res_gl_info.json()
    print(f"      [OK] Model: {gl_info['model_name']} ({gl_info['model_architecture']})")
    print(f"      [OK] Challenge: {gl_info['challenge_dataset']}")
    print(f"      [OK] Validation Benchmarks: {gl_info['validation_benchmarks']}")

    # 4. Nearest Ophthalmologist & Tele-Consultation Notifications
    print("\n[4/7] Testing Nearest Ophthalmologist & Notification Dispatch...")
    res_ophth = client.get("/api/referrals/nearest-ophthalmologist?district=Varanasi")
    assert res_ophth.status_code == 200, f"Nearest ophthalmologist failed: {res_ophth.text}"
    ophth_data = res_ophth.json()
    print(f"      [OK] Matched Hospital: {ophth_data['name']}")
    print(f"      [OK] Consultant: {ophth_data['doctor']} ({ophth_data['distance']}, ETA: {ophth_data['eta']})")

    res_notify = client.post(
        "/api/referrals/notify-parties",
        json={
            "patient_name": "Harish Chandra Verma",
            "patient_id": "vyom1234",
            "referral_token": "#REF-VAR-8842",
            "icdr_grade": "Grade 2: Moderate NPDR",
            "hospital_name": ophth_data["name"],
            "doctor_name": ophth_data["doctor"],
            "google_maps_url": ophth_data["google_maps_url"],
        },
    )
    assert res_notify.status_code == 200, f"Notification failed: {res_notify.text}"
    print(f"      [OK] Notification Response: {res_notify.json()['status']} -> {res_notify.json()['message'][:60]}...")

    # 5. Simulink Edge Telemetry Hub
    print("\n[5/7] Testing Simulink Telemetry Hub Endpoint (50 PHC Nodes)...")
    res_telemetry = client.get("/api/telemetry/simulink-hub?compression=true")
    assert res_telemetry.status_code == 200, f"Telemetry failed: {res_telemetry.text}"
    telemetry_data = res_telemetry.json()
    print(f"      [OK] Total Modeled Screenings: {telemetry_data['total_screenings_modeled']:,}")
    print(f"      [OK] Active PHC Nodes: {telemetry_data['active_phc_nodes']} (returned {len(telemetry_data['phc_nodes'])} nodes)")
    print(f"      [OK] Compression: {telemetry_data['compression_ratio']} (Size: {telemetry_data['packet_size_compressed_mb']} MB)")
    print(f"      [OK] Mean Latency: {telemetry_data['mean_triage_latency_sec']}s (24h SLA: {telemetry_data['sla_24h_adherence_pct']}%)")
    print(f"      [OK] Sample Node: {telemetry_data['phc_nodes'][0]['id']} - {telemetry_data['phc_nodes'][0]['name']} [{telemetry_data['phc_nodes'][0]['status']}]")

    res_capacity = client.get("/api/telemetry/district-capacity/Varanasi")
    assert res_capacity.status_code == 200, f"Capacity simulation failed: {res_capacity.text}"
    print(f"      [OK] District Capacity Solver: {res_capacity.json()['bottleneck_identified']}")

    # 6. Unified DR + Glaucoma Live Prediction & DB Persistence
    print("\n[6/7] Testing Unified DR + Glaucoma Predict with save_to_db=True...")
    png_bytes = create_synthetic_fundus_image()

    # Create dummy patient and facility first so foreign keys succeed
    patient_uuid = uuid.uuid4()
    facility_uuid = uuid.uuid4()
    district_uuid = uuid.uuid4()

    from app.database import SessionLocal

    db = SessionLocal()
    try:
        # Create district & facility
        dist = models.District(id=district_uuid, name="Varanasi", state="Uttar Pradesh")
        db.add(dist)
        fac = models.Facility(id=facility_uuid, name="PHC Varanasi Test Hub", district_id=district_uuid, facility_type_id=1)
        db.add(fac)
        pat = models.Patient(id=patient_uuid, full_name="Test Patient Harish", abha_id=f"ABHA-{uuid.uuid4().hex[:8]}")
        db.add(pat)
        db.commit()
    finally:
        db.close()

    res_pred = client.post(
        "/api/gradings/predict",
        files={"file": ("test_retina.png", png_bytes, "image/png")},
        data={
            "patient_id": str(patient_uuid),
            "facility_id": str(facility_uuid),
            "save_to_db": "true",
            "eye": "right",
            "notes": "Automated verification test scan",
        },
    )
    assert res_pred.status_code == 200, f"Predict failed: {res_pred.text}"
    pred_data = res_pred.json()
    print(f"      [OK] ICDR Grade: Level {pred_data['icdr_level']} ({pred_data['grade_label']})")
    print(f"      [OK] DR Confidence: {pred_data['confidence_score']}%")
    print(f"      [OK] Session ID: {pred_data['session_id']}")
    print(f"      [OK] Fundus Image ID: {pred_data['image_id']}")
    print(f"      [OK] Grading ID: {pred_data['grading_id']}")
    print(f"      [OK] Glaucoma Assessment ID: {pred_data['glaucoma_assessment_id']}")
    assert pred_data["glaucoma_assessment_id"] is not None, "glaucoma_assessment_id must be saved and returned!"

    # 7. Querying Saved Glaucoma Assessment from Database
    print("\n[7/7] Testing Query of Persisted Glaucoma Assessment by ID & List...")
    gl_id = pred_data["glaucoma_assessment_id"]
    res_gl_rec = client.get(f"/api/gradings/glaucoma/{gl_id}")
    assert res_gl_rec.status_code == 200, f"Fetch glaucoma by ID failed: {res_gl_rec.text}"
    gl_rec = res_gl_rec.json()
    print(f"      [OK] Persisted vCDR: {gl_rec['vcdr']}")
    print(f"      [OK] Glaucoma Risk: {gl_rec['glaucoma_risk']} (P: {gl_rec['glaucoma_probability']}%)")
    print(f"      [OK] Disc Center Landmark: {gl_rec['landmarks'].get('disc_center')}")
    print(f"      [OK] Doctor Recommendation: {gl_rec['doctor_recommendation'][:60]}...")

    res_gl_list = client.get("/api/gradings/glaucoma")
    assert res_gl_list.status_code == 200, f"Glaucoma list failed: {res_gl_list.text}"
    assert len(res_gl_list.json()) >= 1, "Glaucoma list must contain at least 1 record"
    print(f"      [OK] Glaucoma Assessments in Database: {len(res_gl_list.json())} records found.")

    print("\n" + "=" * 65)
    print("      [PASS] ALL BACKEND ENDPOINTS & DATABASE TESTS SUCCEEDED!")
    print("=" * 65)


if __name__ == "__main__":
    run_tests()
