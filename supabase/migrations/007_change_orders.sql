-- Create change_orders table
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  change_order_id TEXT NOT NULL,
  drawing_no TEXT NOT NULL,
  hours NUMERIC(10, 2) NOT NULL DEFAULT 0,
  submitted_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on project_id for faster queries
CREATE INDEX IF NOT EXISTS idx_change_orders_project_id ON change_orders(project_id);

-- Create index on change_order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_change_orders_change_order_id ON change_orders(change_order_id);

-- Create index on submitted_date for sorting
CREATE INDEX IF NOT EXISTS idx_change_orders_submitted_date ON change_orders(submitted_date DESC);

-- Enable Row Level Security
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read change orders
CREATE POLICY "Allow authenticated users to read change orders"
  ON change_orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert change orders
CREATE POLICY "Allow authenticated users to insert change orders"
  ON change_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update change orders
CREATE POLICY "Allow authenticated users to update change orders"
  ON change_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete change orders
CREATE POLICY "Allow authenticated users to delete change orders"
  ON change_orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_change_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER change_orders_updated_at
  BEFORE UPDATE ON change_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_change_orders_updated_at();

-- Insert sample data for testing (optional - remove if not needed)
-- This assumes you have projects in your database
INSERT INTO change_orders (project_id, change_order_id, drawing_no, hours, submitted_date, status)
SELECT 
  p.id,
  'CO-' || LPAD((ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.created_at))::TEXT, 3, '0'),
  'DWG-' || LPAD((ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.created_at))::TEXT, 3, '0'),
  (RANDOM() * 100)::NUMERIC(10, 2),
  NOW() - (RANDOM() * INTERVAL '90 days'),
  CASE 
    WHEN RANDOM() < 0.3 THEN 'APP'
    WHEN RANDOM() < 0.6 THEN 'RR'
    ELSE 'FFU'
  END
FROM projects p
CROSS JOIN generate_series(1, 5) -- Creates 5 change orders per project
WHERE EXISTS (SELECT 1 FROM projects LIMIT 1); -- Only if projects exist

-- Add comment to table
COMMENT ON TABLE change_orders IS 'Stores change order information for projects';
COMMENT ON COLUMN change_orders.id IS 'Unique identifier for the change order';
COMMENT ON COLUMN change_orders.project_id IS 'Reference to the project this change order belongs to';
COMMENT ON COLUMN change_orders.change_order_id IS 'Change order number (e.g., CO-001)';
COMMENT ON COLUMN change_orders.drawing_no IS 'Drawing number associated with this change order';
COMMENT ON COLUMN change_orders.hours IS 'Number of hours for this change order';
COMMENT ON COLUMN change_orders.submitted_date IS 'Date when the change order was submitted';
COMMENT ON COLUMN change_orders.status IS 'Status of the change order (APP, RR, FFU, etc.)';
COMMENT ON COLUMN change_orders.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN change_orders.updated_at IS 'Timestamp when the record was last updated';

