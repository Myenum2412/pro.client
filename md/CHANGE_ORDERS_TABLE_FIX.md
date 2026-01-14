# Change Orders Table Fix

## Problem Identified

The `change_orders` table doesn't exist in your Supabase database, causing the API to fail with:

```
Error: Could not find the table 'public.change_orders' in the schema cache
```

## Solution

### Option 1: Run Migration via Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
# Run the migration
supabase db push

# Or apply the specific migration file
supabase migration up
```

### Option 2: Run SQL Directly in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/create_change_orders_table.sql`
4. Click **Run** to execute the migration

### Option 3: Use the SQL Script Directly

Run this SQL in your Supabase SQL Editor:

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_change_orders_project_id ON public.change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_submitted_date ON public.change_orders(submitted_date DESC);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON public.change_orders(status);

-- Enable RLS
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read change orders"
  ON public.change_orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert change orders"
  ON public.change_orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update change orders"
  ON public.change_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete change orders"
  ON public.change_orders FOR DELETE TO authenticated USING (true);

-- Auto-update trigger
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
```

## Table Structure

The `change_orders` table includes:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects table |
| `change_order_id` | TEXT | Change order number (e.g., "CO-001") |
| `drawing_no` | TEXT | Associated drawing number |
| `hours` | NUMERIC | Hours allocated for the change order |
| `submitted_date` | TIMESTAMPTZ | Date the change order was submitted |
| `status` | TEXT | Status (e.g., "Pending", "Approved", "Rejected") |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Record update timestamp |

## Features

✅ **Foreign Key Constraint**: Links to projects table with cascade delete
✅ **Indexes**: Optimized for queries by project_id, submitted_date, and status
✅ **Row Level Security (RLS)**: Enabled with policies for authenticated users
✅ **Auto-update Trigger**: Automatically updates `updated_at` on record changes
✅ **Default Values**: Sensible defaults for new records

## After Migration

Once the table is created:

1. ✅ The Change Orders section will display properly
2. ✅ You can add change order data via the API or directly in Supabase
3. ✅ The table will appear in your project sections

## Adding Sample Data (Optional)

To add test data:

```sql
INSERT INTO public.change_orders (project_id, change_order_id, drawing_no, hours, submitted_date, status)
VALUES
  (
    (SELECT id FROM public.projects LIMIT 1), -- Use first project
    'CO-001',
    'DWG-A101',
    40,
    NOW(),
    'Approved'
  ),
  (
    (SELECT id FROM public.projects LIMIT 1),
    'CO-002',
    'DWG-A102',
    25.5,
    NOW() - INTERVAL '7 days',
    'Pending'
  );
```

## Verification

After running the migration, verify the table exists:

```sql
SELECT * FROM public.change_orders LIMIT 10;
```

You should see the table structure and any sample data you added.

## API Mapping

The API correctly maps the database fields to the frontend:

```typescript
{
  id: co.id,
  changeOrderId: co.change_order_id,
  description: co.drawing_no,
  hours: co.hours,
  date: co.submitted_date,
  status: co.status,
}
```

All set! 🎉

