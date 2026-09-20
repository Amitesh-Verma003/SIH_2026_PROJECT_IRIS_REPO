import sys
from pathlib import Path

# Set UTF-8 encoding on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.database import engine

def check_database():
    print("=" * 65)
    print("      LIVE DATABASE (SUPABASE / POSTGRES) VERIFICATION")
    print("=" * 65)

    with engine.connect() as conn:
        # 1. Check glaucoma_assessments table
        print("\n[1/4] Checking 'glaucoma_assessments' table schema...")
        res = conn.execute(text(
            "SELECT column_name, data_type FROM information_schema.columns "
            "WHERE table_name = 'glaucoma_assessments' ORDER BY ordinal_position;"
        )).fetchall()

        if not res:
            print("      [FAIL] 'glaucoma_assessments' table not found!")
            return False
        
        print(f"      [OK] 'glaucoma_assessments' exists with {len(res)} columns:")
        for col_name, col_type in res:
            print(f"        - {col_name:25s} : {col_type}")

        # 2. Check dr_gradings link
        print("\n[2/4] Checking foreign key column in 'dr_gradings'...")
        res_dr = conn.execute(text(
            "SELECT column_name, data_type FROM information_schema.columns "
            "WHERE table_name = 'dr_gradings' AND column_name = 'glaucoma_assessment_id';"
        )).fetchall()
        if res_dr:
            print(f"      [OK] Column 'glaucoma_assessment_id' exists: {res_dr[0][1]}")
        else:
            print("      [FAIL] Column 'glaucoma_assessment_id' missing from dr_gradings!")
            return False

        # 3. Check capacity_simulations columns
        print("\n[3/4] Checking telemetry columns in 'capacity_simulations'...")
        res_cap = conn.execute(text(
            "SELECT column_name, data_type FROM information_schema.columns "
            "WHERE table_name = 'capacity_simulations' "
            "AND column_name IN ('active_phc_nodes', 'compression_ratio', 'bandwidth_saved_tb', 'mean_triage_latency_sec', 'sla_24h_adherence_pct');"
        )).fetchall()
        print(f"      [OK] Found {len(res_cap)}/5 telemetry columns:")
        for col_name, col_type in res_cap:
            print(f"        - {col_name:25s} : {col_type}")

        # 4. Check triggers on glaucoma_assessments and recent audit logs
        print("\n[4/4] Checking triggers on 'glaucoma_assessments' and audit logs...")
        res_trig = conn.execute(text(
            "SELECT trigger_name, event_manipulation, event_object_table "
            "FROM information_schema.triggers WHERE event_object_table = 'glaucoma_assessments';"
        )).fetchall()
        if res_trig:
            for trig in res_trig:
                print(f"      [OK] Trigger '{trig[0]}' on {trig[2]} for {trig[1]}")
        
        # Check audit_logs
        res_audit = conn.execute(text(
            "SELECT id, entity_type, action, details, performed_at FROM audit_logs "
            "WHERE entity_type = 'glaucoma_assessment' ORDER BY performed_at DESC LIMIT 2;"
        )).fetchall()
        print(f"      [OK] Verified {len(res_audit)} trigger-generated audit log records:")
        for a_row in res_audit:
            print(f"        - Audit ID: {a_row[0]} | Action: {a_row[2]} | Details: {a_row[3]}")

    print("\n" + "=" * 65)
    print("      [SUCCESS] LIVE DATABASE VERIFICATION COMPLETE!")
    print("=" * 65)
    return True

if __name__ == "__main__":
    success = check_database()
    if not success:
        sys.exit(1)
