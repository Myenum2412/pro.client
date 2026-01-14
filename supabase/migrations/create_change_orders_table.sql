-- Create change_orders table
CREATE TABLE IF NOT EXISTS public.change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  change_order_id TEXT NOT NULL,
  drawing_no TEXT NOT NULL,
  hours NUMERIC NOT NULL DEFAULT 0,
  submitted_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_change_orders_project_id ON public.change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_submitted_date ON public.change_orders(submitted_date DESC);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON public.change_orders(status);

-- Enable Row Level Security
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read all change orders
CREATE POLICY "Allow authenticated users to read change orders"
  ON public.change_orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert change orders
CREATE POLICY "Allow authenticated users to insert change orders"
  ON public.change_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update change orders
CREATE POLICY "Allow authenticated users to update change orders"
  ON public.change_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete change orders
CREATE POLICY "Allow authenticated users to delete change orders"
  ON public.change_orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_change_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_change_orders_updated_at
  BEFORE UPDATE ON public.change_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_change_orders_updated_at();

-- Sample seed data for change orders
-- This creates 5 change orders per project with realistic data
INSERT INTO public.change_orders (project_id, change_order_id, drawing_no, hours, submitted_date, status)
SELECT 
  p.id as project_id,
  'CO-' || LPAD((ROW_NUMBER() OVER (ORDER BY p.id, gs.num))::text, 3, '0') as change_order_id,
  'DWG-' || LPAD((RANDOM() * 9999)::int::text, 4, '0') as drawing_no,
  (RANDOM() * 40 + 5)::numeric(10,1) as hours,
  NOW() - (RANDOM() * 90 || ' days')::interval as submitted_date,
  CASE ((RANDOM() * 4)::int)
    WHEN 0 THEN 'Pending'
    WHEN 1 THEN 'Approved'
    WHEN 2 THEN 'In Review'
    WHEN 3 THEN 'Rejected'
    ELSE 'Pending'
  END as status
FROM public.projects p
CROSS JOIN generate_series(1, 5) gs(num) -- 5 change orders per project
ORDER BY p.id, gs.num
LIMIT 50; -- Total 50 change orders (adjust based on number of projects)

