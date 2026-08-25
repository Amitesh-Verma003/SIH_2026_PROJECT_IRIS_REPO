"""
Seed initial districts and facilities for IRIS AI platform.
Populates standard districts and PHC/HWC facilities so screenings
can be assigned to realistic healthcare facilities across India.
"""
import uuid
from app.database import SessionLocal
from app import models

DISTRICT_FACILITY_DATA = [
    {
        "district": "Varanasi",
        "state": "Uttar Pradesh",
        "population": 3676841,
        "diabetic_pop": 380000,
        "facilities": [
            {"name": "PHC Varanasi Rural - Block Kashi", "type_id": 1, "address": "Village Kashi, Varanasi, UP"},
            {"name": "CHC Shivpur Community Health Centre", "type_id": 1, "address": "Shivpur, Varanasi, UP"},
            {"name": "Pandit Deen Dayal Upadhyay District Hospital", "type_id": 3, "address": "Pandeypur, Varanasi, UP"},
        ]
    },
    {
        "district": "Gorakhpur",
        "state": "Uttar Pradesh",
        "population": 4440895,
        "diabetic_pop": 450000,
        "facilities": [
            {"name": "PHC Chargawan Gorakhpur", "type_id": 1, "address": "Chargawan, Gorakhpur, UP"},
            {"name": "District Hospital Gorakhpur", "type_id": 3, "address": "Golghar, Gorakhpur, UP"},
        ]
    },
    {
        "district": "Lucknow",
        "state": "Uttar Pradesh",
        "population": 4589838,
        "diabetic_pop": 520000,
        "facilities": [
            {"name": "PHC Bakshi Ka Talab", "type_id": 1, "address": "BKT, Lucknow, UP"},
            {"name": "King George's Medical University Tele-Ophth Hub", "type_id": 5, "address": "Chowk, Lucknow, UP"},
        ]
    },
    {
        "district": "Gadchiroli",
        "state": "Maharashtra",
        "population": 1072942,
        "diabetic_pop": 95000,
        "facilities": [
            {"name": "PHC Armori Tribal Outreach Centre", "type_id": 1, "address": "Armori, Gadchiroli, Maharashtra"},
            {"name": "District Civil Hospital Gadchiroli", "type_id": 3, "address": "Gadchiroli, Maharashtra"},
        ]
    },
    {
        "district": "Pune",
        "state": "Maharashtra",
        "population": 9429408,
        "diabetic_pop": 980000,
        "facilities": [
            {"name": "PHC Haveli Rural Tele-Eye Unit", "type_id": 1, "address": "Haveli, Pune, Maharashtra"},
            {"name": "Sassoon General Hospital Eye Clinic", "type_id": 3, "address": "Station Road, Pune, Maharashtra"},
        ]
    },
    {
        "district": "Belagavi",
        "state": "Karnataka",
        "population": 4779661,
        "diabetic_pop": 480000,
        "facilities": [
            {"name": "PHC Gokak Primary Health Centre", "type_id": 1, "address": "Gokak, Belagavi, Karnataka"},
            {"name": "BIMS Belagavi District Hospital", "type_id": 3, "address": "Belagavi, Karnataka"},
        ]
    },
    {
        "district": "Patna",
        "state": "Bihar",
        "population": 5838465,
        "diabetic_pop": 610000,
        "facilities": [
            {"name": "PHC Phulwari Sharif", "type_id": 1, "address": "Phulwari Sharif, Patna, Bihar"},
            {"name": "PMCH Eye Institute & Tele-Hub", "type_id": 5, "address": "Ashok Rajpath, Patna, Bihar"},
        ]
    }
]


def seed_database():
    db = SessionLocal()
    try:
        total_created_facilities = 0
        total_created_districts = 0

        for item in DISTRICT_FACILITY_DATA:
            # Check or create district
            district = db.query(models.District).filter(
                models.District.name == item["district"],
                models.District.state == item["state"]
            ).first()

            if not district:
                district = models.District(
                    name=item["district"],
                    state=item["state"],
                    estimated_population=item["population"],
                    estimated_diabetic_population=item["diabetic_pop"],
                    ophthalmologist_count=4,
                    target_annual_screenings=12000,
                )
                db.add(district)
                db.commit()
                db.refresh(district)
                total_created_districts += 1

            # Seed facilities for this district
            for fac in item["facilities"]:
                existing_fac = db.query(models.Facility).filter(
                    models.Facility.name == fac["name"],
                    models.Facility.district_id == district.id
                ).first()

                if not existing_fac:
                    facility = models.Facility(
                        name=fac["name"],
                        facility_type_id=fac["type_id"],
                        district_id=district.id,
                        address=fac["address"],
                        is_active=True,
                        contact_phone="+91-542-2500000",
                        contact_email="phc.tele-ophthalmology@gov.in",
                    )
                    db.add(facility)
                    total_created_facilities += 1

        db.commit()
        print(f"Seed completed successfully! Created {total_created_districts} districts, {total_created_facilities} facilities.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
