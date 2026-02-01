-- Platform Learning System Migration
-- Tracks generation attempts, outcomes, patterns, and learnings for continuous improvement

-- =====================================================
-- GENERATION LOGS - Detailed log of every generation
-- =====================================================
CREATE TABLE IF NOT EXISTS generation_logs (
  id SERIAL PRIMARY KEY,

  -- Link to project (optional - may not have project if generation failed early)
  project_id INTEGER REFERENCES generated_projects(id),

  -- Input Parameters (what the user requested)
  business_name VARCHAR(255),
  industry_key VARCHAR(100),
  industry_detected VARCHAR(100), -- What we detected vs what user selected
  description_text TEXT,
  description_length INTEGER, -- Track if longer descriptions = better results

  -- Mood Sliders (creative direction)
  mood_vibe INTEGER, -- 0-100
  mood_energy INTEGER,
  mood_era INTEGER,
  mood_density INTEGER,
  mood_price INTEGER,
  mood_preset VARCHAR(50), -- If they used a preset

  -- Configuration
  pages_requested TEXT[], -- Array of page IDs
  pages_generated INTEGER,
  admin_tier VARCHAR(50),
  admin_modules TEXT[],
  layout_key VARCHAR(100),
  effects TEXT[],
  test_mode BOOLEAN DEFAULT FALSE,
  enhance_mode BOOLEAN DEFAULT FALSE, -- Rebuild mode

  -- Outcome
  status VARCHAR(50) DEFAULT 'started', -- started, generating, completed, failed, audit_failed
  success BOOLEAN,
  error_type VARCHAR(100),
  error_message TEXT,
  error_file VARCHAR(255),
  error_line INTEGER,

  -- Audit Results
  audit_passed BOOLEAN,
  audit_errors INTEGER DEFAULT 0,
  audit_warnings INTEGER DEFAULT 0,
  audit_fixes_applied INTEGER DEFAULT 0,

  -- Performance Metrics
  generation_time_ms INTEGER,
  audit_time_ms INTEGER,
  total_time_ms INTEGER,

  -- Cost Tracking
  api_input_tokens INTEGER DEFAULT 0,
  api_output_tokens INTEGER DEFAULT 0,
  api_cost DECIMAL(10,6) DEFAULT 0,

  -- User Feedback (populated later if available)
  user_rating INTEGER, -- 1-5 stars
  user_rebuilt BOOLEAN DEFAULT FALSE, -- Did they rebuild this?
  user_feedback TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Full input/output for debugging (JSON)
  input_params JSONB,
  output_summary JSONB
);

-- =====================================================
-- LEARNING PATTERNS - Discovered patterns and insights
-- =====================================================
CREATE TABLE IF NOT EXISTS learning_patterns (
  id SERIAL PRIMARY KEY,

  -- Pattern identification
  pattern_type VARCHAR(50) NOT NULL, -- 'success_combo', 'failure_pattern', 'preference', 'optimization'
  pattern_key VARCHAR(255) NOT NULL, -- Unique key for this pattern

  -- Pattern details
  industry VARCHAR(100),
  conditions JSONB, -- What conditions trigger this pattern

  -- Statistics
  occurrence_count INTEGER DEFAULT 1,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2), -- Percentage

  -- What we learned
  insight TEXT, -- Human-readable description
  action_recommended TEXT, -- What to do when this pattern is detected
  auto_apply BOOLEAN DEFAULT FALSE, -- Should we auto-apply this learning?

  -- Confidence and validation
  confidence_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  validated BOOLEAN DEFAULT FALSE, -- Has a human reviewed this?
  validated_by VARCHAR(255),
  validated_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ERROR PATTERNS - Track specific errors and fixes
-- =====================================================
CREATE TABLE IF NOT EXISTS error_patterns (
  id SERIAL PRIMARY KEY,

  -- Error identification
  error_hash VARCHAR(64) UNIQUE, -- MD5 hash of normalized error message
  error_type VARCHAR(100), -- IMPORT_ERROR, SYNTAX_ERROR, BUILD_FAIL, etc.
  error_message TEXT,
  error_file_pattern VARCHAR(255), -- Pattern of file where error occurs

  -- Context
  industry VARCHAR(100),
  page_type VARCHAR(100),
  related_feature VARCHAR(100), -- e.g., 'CartContext', 'VideoBackground'

  -- Statistics
  occurrence_count INTEGER DEFAULT 1,
  fixed_count INTEGER DEFAULT 0,
  fix_success_rate DECIMAL(5,2),

  -- Fix information
  fix_available BOOLEAN DEFAULT FALSE,
  fix_type VARCHAR(50), -- 'auto', 'manual', 'config', 'prompt_adjustment'
  fix_description TEXT,
  fix_code TEXT, -- Actual fix code if applicable
  prompt_adjustment TEXT, -- How to adjust prompts to avoid this

  -- Timestamps
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SLIDER EFFECTIVENESS - Track which slider combos work
-- =====================================================
CREATE TABLE IF NOT EXISTS slider_effectiveness (
  id SERIAL PRIMARY KEY,

  -- Slider combination (rounded to nearest 10 for grouping)
  vibe_bucket INTEGER, -- 0, 10, 20, ..., 100
  energy_bucket INTEGER,
  era_bucket INTEGER,
  density_bucket INTEGER,
  price_bucket INTEGER,

  -- Context
  industry VARCHAR(100),

  -- Effectiveness metrics
  usage_count INTEGER DEFAULT 1,
  success_count INTEGER DEFAULT 0,
  audit_pass_count INTEGER DEFAULT 0,
  user_rebuilt_count INTEGER DEFAULT 0, -- Lower is better
  avg_rating DECIMAL(3,2), -- Average user rating

  -- Timestamps
  first_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_gen_logs_created ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gen_logs_industry ON generation_logs(industry_key);
CREATE INDEX IF NOT EXISTS idx_gen_logs_status ON generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_gen_logs_success ON generation_logs(success);
CREATE INDEX IF NOT EXISTS idx_gen_logs_error_type ON generation_logs(error_type) WHERE error_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gen_logs_test_mode ON generation_logs(test_mode);

CREATE INDEX IF NOT EXISTS idx_patterns_type ON learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_industry ON learning_patterns(industry);
CREATE INDEX IF NOT EXISTS idx_patterns_confidence ON learning_patterns(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_auto ON learning_patterns(auto_apply) WHERE auto_apply = TRUE;

CREATE INDEX IF NOT EXISTS idx_errors_type ON error_patterns(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_industry ON error_patterns(industry);
CREATE INDEX IF NOT EXISTS idx_errors_hash ON error_patterns(error_hash);
CREATE INDEX IF NOT EXISTS idx_errors_fixable ON error_patterns(fix_available) WHERE fix_available = TRUE;

CREATE INDEX IF NOT EXISTS idx_slider_industry ON slider_effectiveness(industry);
CREATE INDEX IF NOT EXISTS idx_slider_usage ON slider_effectiveness(usage_count DESC);

-- =====================================================
-- UNIQUE CONSTRAINTS
-- =====================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_patterns_unique ON learning_patterns(pattern_type, pattern_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_slider_combo ON slider_effectiveness(
  industry, vibe_bucket, energy_bucket, era_bucket, density_bucket, price_bucket
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to bucket slider values (rounds to nearest 10)
CREATE OR REPLACE FUNCTION bucket_slider(value INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN ROUND(COALESCE(value, 50) / 10.0) * 10;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate error hash
CREATE OR REPLACE FUNCTION error_hash(error_msg TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  -- Normalize the error message (remove line numbers, file paths) then hash
  RETURN MD5(REGEXP_REPLACE(
    REGEXP_REPLACE(error_msg, ':\d+:\d+', ':X:X'), -- Remove line:col
    '(/[^\s]+)', '/PATH'  -- Remove file paths
  ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update slider effectiveness stats
CREATE OR REPLACE FUNCTION update_slider_stats(
  p_industry VARCHAR(100),
  p_vibe INTEGER,
  p_energy INTEGER,
  p_era INTEGER,
  p_density INTEGER,
  p_price INTEGER,
  p_success BOOLEAN,
  p_audit_passed BOOLEAN,
  p_user_rating INTEGER DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO slider_effectiveness (
    industry, vibe_bucket, energy_bucket, era_bucket, density_bucket, price_bucket,
    usage_count, success_count, audit_pass_count, avg_rating
  ) VALUES (
    p_industry,
    bucket_slider(p_vibe),
    bucket_slider(p_energy),
    bucket_slider(p_era),
    bucket_slider(p_density),
    bucket_slider(p_price),
    1,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN p_audit_passed THEN 1 ELSE 0 END,
    p_user_rating
  )
  ON CONFLICT (industry, vibe_bucket, energy_bucket, era_bucket, density_bucket, price_bucket)
  DO UPDATE SET
    usage_count = slider_effectiveness.usage_count + 1,
    success_count = slider_effectiveness.success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    audit_pass_count = slider_effectiveness.audit_pass_count + CASE WHEN p_audit_passed THEN 1 ELSE 0 END,
    avg_rating = CASE
      WHEN p_user_rating IS NOT NULL THEN
        (slider_effectiveness.avg_rating * slider_effectiveness.usage_count + p_user_rating) / (slider_effectiveness.usage_count + 1)
      ELSE slider_effectiveness.avg_rating
    END,
    last_used_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to record an error pattern
CREATE OR REPLACE FUNCTION record_error_pattern(
  p_error_msg TEXT,
  p_error_type VARCHAR(100),
  p_industry VARCHAR(100) DEFAULT NULL,
  p_page_type VARCHAR(100) DEFAULT NULL,
  p_file_pattern VARCHAR(255) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_hash VARCHAR(64);
  v_id INTEGER;
BEGIN
  v_hash := error_hash(p_error_msg);

  INSERT INTO error_patterns (error_hash, error_type, error_message, industry, page_type, error_file_pattern)
  VALUES (v_hash, p_error_type, p_error_msg, p_industry, p_page_type, p_file_pattern)
  ON CONFLICT (error_hash) DO UPDATE SET
    occurrence_count = error_patterns.occurrence_count + 1,
    last_seen_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- View for generation success rates by industry
CREATE OR REPLACE VIEW v_industry_success_rates AS
SELECT
  industry_key,
  COUNT(*) as total_generations,
  COUNT(*) FILTER (WHERE success = TRUE) as successful,
  COUNT(*) FILTER (WHERE audit_passed = TRUE) as audit_passed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE success = TRUE) / NULLIF(COUNT(*), 0), 2) as success_rate,
  ROUND(AVG(generation_time_ms)::numeric, 0) as avg_generation_time_ms,
  ROUND(AVG(api_cost)::numeric, 4) as avg_cost
FROM generation_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY industry_key
ORDER BY total_generations DESC;

-- View for common errors
CREATE OR REPLACE VIEW v_common_errors AS
SELECT
  error_type,
  error_message,
  industry,
  occurrence_count,
  fixed_count,
  fix_available,
  fix_description,
  ROUND(100.0 * fixed_count / NULLIF(occurrence_count, 0), 2) as fix_rate
FROM error_patterns
ORDER BY occurrence_count DESC
LIMIT 50;
