-- ============================================================================
-- SCAN_HISTORY TABLE
-- Stores OCR scan history with extracted text and metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scan_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- Scan content
  extracted_text text NOT NULL,
  detected_drawing_number text,
  image_data_url text, -- Base64 encoded image (optional, for privacy can be excluded)
  
  -- Processing metadata
  ocr_confidence numeric,
  processing_time_ms integer,
  language_detected text,
  
  -- Camera/Device metadata
  device_type text, -- 'mobile' | 'desktop'
  camera_facing text, -- 'back' | 'front'
  image_width integer,
  image_height integer,
  
  -- Search results
  drawing_data jsonb, -- Full drawing data if found
  
  -- Timestamp
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT scan_history_pkey PRIMARY KEY (id),
  CONSTRAINT scan_history_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS scan_history_user_id_idx ON public.scan_history(user_id);
CREATE INDEX IF NOT EXISTS scan_history_created_at_idx ON public.scan_history(created_at DESC);
CREATE INDEX IF NOT EXISTS scan_history_detected_drawing_number_idx ON public.scan_history(detected_drawing_number);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "scan_history_select_own" ON public.scan_history;
CREATE POLICY "scan_history_select_own"
  ON public.scan_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "scan_history_insert_own" ON public.scan_history;
CREATE POLICY "scan_history_insert_own"
  ON public.scan_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scan_history_delete_own" ON public.scan_history;
CREATE POLICY "scan_history_delete_own"
  ON public.scan_history FOR DELETE
  USING (auth.uid() = user_id);

