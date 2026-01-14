-- ============================================================================
-- DRAWING_LOG_VERSION_HISTORY TABLE
-- Tracks all changes made to drawing_log entries
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.drawing_log_version_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  drawing_log_id uuid NOT NULL,
  version_number integer NOT NULL,
  
  -- Snapshot of the record before the change
  old_data jsonb,
  
  -- Snapshot of the record after the change
  new_data jsonb,
  
  -- Change details
  changed_fields text[],
  change_summary text,
  change_type text NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Editor information
  editor_id uuid,
  editor_name text,
  editor_email text,
  
  -- Timestamp
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT drawing_log_version_history_pkey PRIMARY KEY (id),
  CONSTRAINT drawing_log_version_history_drawing_log_id_fkey 
    FOREIGN KEY (drawing_log_id) REFERENCES public.drawing_log(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS drawing_log_version_history_drawing_log_id_idx 
  ON public.drawing_log_version_history(drawing_log_id);
CREATE INDEX IF NOT EXISTS drawing_log_version_history_created_at_idx 
  ON public.drawing_log_version_history(created_at DESC);
CREATE INDEX IF NOT EXISTS drawing_log_version_history_editor_id_idx 
  ON public.drawing_log_version_history(editor_id);

ALTER TABLE public.drawing_log_version_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "drawing_log_version_history_select_all" ON public.drawing_log_version_history;
CREATE POLICY "drawing_log_version_history_select_all"
  ON public.drawing_log_version_history FOR SELECT
  USING (true);

-- ============================================================================
-- FUNCTION: Track drawing_log changes
-- ============================================================================
CREATE OR REPLACE FUNCTION track_drawing_log_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data jsonb;
  v_new_data jsonb;
  v_changed_fields text[];
  v_change_summary text;
  v_editor_id uuid;
  v_editor_name text;
  v_editor_email text;
  v_version_number integer;
BEGIN
  -- Get editor information from auth context
  v_editor_id := auth.uid();
  IF v_editor_id IS NOT NULL THEN
    SELECT 
      COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
      email
    INTO v_editor_name, v_editor_email
    FROM auth.users
    WHERE id = v_editor_id;
  END IF;

  -- Determine change type and prepare data
  IF TG_OP = 'INSERT' THEN
    v_new_data := to_jsonb(NEW);
    v_old_data := NULL;
    v_changed_fields := ARRAY[]::text[];
    v_change_summary := 'Drawing log entry created';
    
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM public.drawing_log_version_history
    WHERE drawing_log_id = NEW.id;
    
    INSERT INTO public.drawing_log_version_history (
      drawing_log_id,
      version_number,
      old_data,
      new_data,
      changed_fields,
      change_summary,
      change_type,
      editor_id,
      editor_name,
      editor_email
    ) VALUES (
      NEW.id,
      COALESCE(v_version_number, 1),
      v_old_data,
      v_new_data,
      v_changed_fields,
      v_change_summary,
      'INSERT',
      v_editor_id,
      v_editor_name,
      v_editor_email
    );
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    
    -- Identify changed fields
    SELECT ARRAY_AGG(key)
    INTO v_changed_fields
    FROM jsonb_each(v_old_data)
    WHERE value IS DISTINCT FROM (v_new_data->key);
    
    -- Build change summary
    v_change_summary := '';
    IF array_length(v_changed_fields, 1) > 0 THEN
      v_change_summary := 'Updated fields: ' || array_to_string(v_changed_fields, ', ');
    ELSE
      v_change_summary := 'No significant changes detected';
    END IF;
    
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM public.drawing_log_version_history
    WHERE drawing_log_id = NEW.id;
    
    -- Only create history entry if there are actual changes (excluding updated_at)
    IF v_changed_fields IS NOT NULL AND array_length(v_changed_fields, 1) > 0 THEN
      -- Remove 'updated_at' from changed fields if it's the only change
      v_changed_fields := array_remove(v_changed_fields, 'updated_at');
      
      IF array_length(v_changed_fields, 1) > 0 THEN
        INSERT INTO public.drawing_log_version_history (
          drawing_log_id,
          version_number,
          old_data,
          new_data,
          changed_fields,
          change_summary,
          change_type,
          editor_id,
          editor_name,
          editor_email
        ) VALUES (
          NEW.id,
          COALESCE(v_version_number, 1),
          v_old_data,
          v_new_data,
          v_changed_fields,
          v_change_summary,
          'UPDATE',
          v_editor_id,
          v_editor_name,
          v_editor_email
        );
      END IF;
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
    v_changed_fields := ARRAY[]::text[];
    v_change_summary := 'Drawing log entry deleted';
    
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM public.drawing_log_version_history
    WHERE drawing_log_id = OLD.id;
    
    INSERT INTO public.drawing_log_version_history (
      drawing_log_id,
      version_number,
      old_data,
      new_data,
      changed_fields,
      change_summary,
      change_type,
      editor_id,
      editor_name,
      editor_email
    ) VALUES (
      OLD.id,
      COALESCE(v_version_number, 1),
      v_old_data,
      v_new_data,
      v_changed_fields,
      v_change_summary,
      'DELETE',
      v_editor_id,
      v_editor_name,
      v_editor_email
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Automatically track drawing_log changes
-- ============================================================================
DROP TRIGGER IF EXISTS drawing_log_version_history_trigger ON public.drawing_log;
CREATE TRIGGER drawing_log_version_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.drawing_log
  FOR EACH ROW
  EXECUTE FUNCTION track_drawing_log_changes();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.drawing_log_version_history IS 'Version history for all changes to drawing_log entries';
COMMENT ON COLUMN public.drawing_log_version_history.old_data IS 'JSON snapshot of the record before the change';
COMMENT ON COLUMN public.drawing_log_version_history.new_data IS 'JSON snapshot of the record after the change';
COMMENT ON COLUMN public.drawing_log_version_history.changed_fields IS 'Array of field names that were changed';
COMMENT ON COLUMN public.drawing_log_version_history.change_summary IS 'Human-readable summary of the changes';
COMMENT ON COLUMN public.drawing_log_version_history.change_type IS 'Type of change: INSERT, UPDATE, or DELETE';

