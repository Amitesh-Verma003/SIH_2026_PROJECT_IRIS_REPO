-- ============================================================================
-- IRIS AI: Supabase Database Schema Update (Glaucoma UNet & Simulink Telemetry)
-- ============================================================================
-- Execute these SQL commands directly in the Supabase SQL Editor.
-- This script is fully idempotent and safe to run multiple times.
-- ============================================================================

-- Enable pgcrypto / uuid-ossp for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. GLAUCOMA ASSESSMENTS TABLE (REFUGE UNet Segmentation & Risk Triage)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS glaucoma_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL REFERENCES fundus_images(id) ON DELETE CASCADE,
    model_version_id UUID REFERENCES model_versions(id) ON DELETE SET NULL,
    
    -- Optic Cup-to-Disc Ratio (CDR) Measurements
    vcdr NUMERIC(4, 3) NOT NULL,                           -- Vertical CDR (Primary clinical metric)
    hcdr NUMERIC(4, 3),                                    -- Horizontal CDR
    area_cdr NUMERIC(4, 3),                                -- Area Cup-to-Disc Ratio
    
    -- Risk Stratification & Model Outputs
    glaucoma_detected BOOLEAN NOT NULL DEFAULT FALSE,
    glaucoma_risk TEXT NOT NULL,                           -- 'Normal / Low Risk' | 'Borderline / Suspect' | 'High Risk'
    glaucoma_probability NUMERIC(5, 2),                   -- Softmax / Logistic probability (0.00 to 100.00%)
    referable_flag BOOLEAN NOT NULL DEFAULT FALSE,         -- True if vCDR >= 0.50 or prob >= 20%
    urgency_level TEXT NOT NULL DEFAULT 'LOW',             -- 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
    badge_color TEXT NOT NULL DEFAULT '#10B981',           -- Emerald (#10B981), Amber (#F59E0B), Rose (#EF4444)
    
    -- Neuroretinal Rim Morphometry
    rim_disc_ratio NUMERIC(4, 3),                          -- Rim-to-disc ratio (1.0 - vCDR)
    isnt_rule_compliance TEXT,                             -- 'Normal ISNT contour' | 'Inferior/Superior Notch Suspected'
    vertical_disc_diameter_px INTEGER,
    vertical_cup_diameter_px INTEGER,
    
    -- Segmentation Geometry (JSONB)
    -- Stores: disc_center {x, y}, cup_center {x, y}, disc_radius_pct, cup_radius_pct,
    -- disc_contour [{x, y}, ...], cup_contour [{x, y}, ...]
    landmarks JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Clinical Guidance & Overlay Artifact
    doctor_recommendation TEXT,
    overlay_base64 TEXT,                                   -- Base64-encoded transparent PNG overlay
    
    -- Timestamps
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. LINK DR GRADINGS TO GLAUCOMA ASSESSMENTS (Unified Multi-Path Screening)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dr_gradings' AND column_name = 'glaucoma_assessment_id'
    ) THEN
        ALTER TABLE dr_gradings 
        ADD COLUMN glaucoma_assessment_id UUID REFERENCES glaucoma_assessments(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. ENSURE CAPACITY SIMULATIONS TABLE SUPPORTS SIMULINK TELEMETRY ATTRIBUTES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'capacity_simulations' AND column_name = 'active_phc_nodes'
    ) THEN
        ALTER TABLE capacity_simulations 
        ADD COLUMN active_phc_nodes INTEGER DEFAULT 50,
        ADD COLUMN compression_ratio TEXT DEFAULT '8.4:1',
        ADD COLUMN bandwidth_saved_tb NUMERIC(6, 2) DEFAULT 2.14,
        ADD COLUMN mean_triage_latency_sec NUMERIC(5, 2) DEFAULT 22.4,
        ADD COLUMN sla_24h_adherence_pct NUMERIC(5, 2) DEFAULT 98.4;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_glaucoma_assessments_image_id ON glaucoma_assessments(image_id);
CREATE INDEX IF NOT EXISTS idx_glaucoma_assessments_glaucoma_risk ON glaucoma_assessments(glaucoma_risk);
CREATE INDEX IF NOT EXISTS idx_glaucoma_assessments_referable_flag ON glaucoma_assessments(referable_flag);
CREATE INDEX IF NOT EXISTS idx_glaucoma_assessments_assessed_at ON glaucoma_assessments(assessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_dr_gradings_glaucoma_id ON dr_gradings(glaucoma_assessment_id);
CREATE INDEX IF NOT EXISTS idx_capacity_simulations_district_id ON capacity_simulations(district_id);

-- ----------------------------------------------------------------------------
-- 5. SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE glaucoma_assessments ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated and anonymous users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'glaucoma_assessments' AND policyname = 'Allow public read access for glaucoma assessments'
    ) THEN
        CREATE POLICY "Allow public read access for glaucoma assessments"
        ON glaucoma_assessments FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'glaucoma_assessments' AND policyname = 'Allow service role and authenticated insert on glaucoma assessments'
    ) THEN
        CREATE POLICY "Allow service role and authenticated insert on glaucoma assessments"
        ON glaucoma_assessments FOR INSERT
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'glaucoma_assessments' AND policyname = 'Allow service role and authenticated update on glaucoma assessments'
    ) THEN
        CREATE POLICY "Allow service role and authenticated update on glaucoma assessments"
        ON glaucoma_assessments FOR UPDATE
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. AUDIT LOG TRIGGER FOR GLAUCOMA TRIAGE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_glaucoma_assessment_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (id, entity_type, entity_id, action, details, performed_at)
    VALUES (
        gen_random_uuid(),
        'glaucoma_assessment',
        NEW.id,
        'CREATED',
        jsonb_build_object(
            'image_id', NEW.image_id,
            'vcdr', NEW.vcdr,
            'glaucoma_risk', NEW.glaucoma_risk,
            'referable_flag', NEW.referable_flag,
            'urgency_level', NEW.urgency_level
        ),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log audit record on every new glaucoma assessment (Postgres 14+)
CREATE OR REPLACE TRIGGER trg_audit_glaucoma_assessment
AFTER INSERT ON glaucoma_assessments
FOR EACH ROW
EXECUTE FUNCTION log_glaucoma_assessment_audit();

-- ============================================================================
-- VERIFICATION QUERY:
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'glaucoma_assessments' 
-- ORDER BY ordinal_position;
-- ============================================================================
