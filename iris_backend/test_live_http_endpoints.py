"""
IRIS AI — Live HTTP Endpoint Health & Integration Verification
=============================================================
Tests live HTTP calls against http://127.0.0.1:8000
"""

import sys
import json
import urllib.request
import urllib.error

# Force UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "HealthChecker/1.0"})
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def post_json(path, data):
    url = f"{BASE_URL}{path}"
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "HealthChecker/1.0"}
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def main():
    print("=" * 65)
    print("      LIVE HTTP NETWORK ENDPOINTS HEALTH CHECK (PORT 8000)")
    print("=" * 65)

    endpoints = [
        ("GET", "/api/health", "System Health Check"),
        ("GET", "/api/stats/dashboard", "Dashboard Aggregates"),
        ("GET", "/api/gradings/model-info", "DR Model Info"),
        ("GET", "/api/gradings/glaucoma/model-info", "Glaucoma UNet Model Info"),
        ("GET", "/api/referrals/nearest-ophthalmologist?district=Varanasi", "Nearest Ophthalmologist Proximity"),
        ("GET", "/api/telemetry/simulink-hub?compression=true", "Simulink Hub (Wavelet 8.4:1)"),
        ("GET", "/api/telemetry/simulink-hub?compression=false", "Simulink Hub (Raw DICOM)"),
        ("GET", "/api/telemetry/district-capacity/Varanasi", "District Capacity Simulation"),
        ("GET", "/api/gradings/glaucoma", "Glaucoma Historical Assessments"),
    ]

    all_passed = True

    for method, path, desc in endpoints:
        try:
            status, res = get(path)
            if status == 200:
                print(f"[OK 200] {desc:38s} -> {path}")
            else:
                print(f"[FAIL {status}] {desc:38s} -> {path}")
                all_passed = False
        except Exception as e:
            print(f"[ERR] {desc:38s} -> {path} ({e})")
            all_passed = False

    # Test POST notification
    print("\nTesting Notification Dispatch (POST)...")
    try:
        status, res = post_json("/api/referrals/notify-parties", {
            "patient_name": "Raghav Shisodia",
            "patient_id": "vyoa1234",
            "referral_token": "#REF-TEST-9921",
            "icdr_grade": "Level 2: Moderate NPDR",
            "hospital_name": "IMS-BHU Regional Eye Institute",
            "doctor_name": "Dr. Arvind Kumar Singh",
            "google_maps_url": "https://maps.google.com"
        })
        if status == 200 and res.get("status") == "DISPATCHED":
            print(f"[OK 200] Notification Dispatch -> {res.get('message')[:60]}...")
        else:
            print(f"[FAIL] Notification Dispatch returned: {res}")
            all_passed = False
    except Exception as e:
        print(f"[ERR] Notification Dispatch: {e}")
        all_passed = False

    print("=" * 65)
    if all_passed:
        print("      [SUCCESS] ALL LIVE HTTP NETWORK ENDPOINTS ARE HEALTHY!")
    else:
        print("      [FAIL] SOME ENDPOINTS FAILED")
    print("=" * 65)

    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
