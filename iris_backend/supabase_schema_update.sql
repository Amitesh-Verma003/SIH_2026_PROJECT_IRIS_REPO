-- ============================================================================
-- IRIS AI: Supabase Database Schema Update (Glaucoma UNet & Simulink Telemetry)
-- ============================================================================
-- Execute these SQL commands directly in the Supabase SQL Editor.
-- This script is fully idempotent and safe to run multiple times.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GLAUCOMA ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS glaucoma_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL REFERENCES fundus_images(id) ON DELETE CASCADE,
    model_version_id UUID REFERENCES model_versions(id) ON DELETE SET NULL,
    vcdr NUMERIC(4, 3) NOT NULL,
    hcdr NUMERIC(4, 3),
    area_cdr NUMERIC(4, 3),
    glaucoma_detected BOOLEAN NOT NULL DEFAULT FALSE,
    glaucoma_risk TEXT NOT NULL,
    glaucoma_probability NUMERIC(5, 2),
    referable_flag BOOLEAN NOT NULL DEFAULT FALSE,
    urgency_level TEXT NOT NULL DEFAULT 'LOW',
    badge_color TEXT NOT NULL DEFAULT '#10B981',
    rim_disc_ratio NUMERIC(4, 3),
    isnt_rule_compliance TEXT,
    vertical_disc_diameter_px INTEGER,
    vertical_cup_diameter_px INTEGER,
    landmarks JSONB NOT NULL DEFAULT '{}'::jsonb,
    doctor_recommendation TEXT,
    overlay_base64 TEXT,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. LINK DR GRADINGS TO GLAUCOMA ASSESSMENTS
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

-- 3. ENSURE CAPACITY SIMULATIONS TABLE SUPPORTS SIMULINK TELEMETRY ATTRIBUTES
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

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_glaucoma_assessments_image_id ON glaucoma_assessments(image_id);
CREATE INDEX IF NOT EXISTS idx_glaucoma_assessments_glaucoma_risk ON glaucoma_assessments(glaucoma_risk);
CREATE INDEX IF NOT EXISTS idx_glaucoma_assessments_referable_flag ON glaucoma_assessments(referable_flag);
CREATE INDEX IF NOT EXISTS idx_glaucoma_assessments_assessed_at ON glaucoma_assessments(assessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_dr_gradings_glaucoma_id ON dr_gradings(glaucoma_assessment_id);
CREATE INDEX IF NOT EXISTS idx_capacity_simulations_district_id ON capacity_simulations(district_id);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE glaucoma_assessments ENABLE ROW LEVEL SECURITY;

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
END $$;
