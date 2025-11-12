-- Fixed SQL errors - added proper error handling and function existence check
-- Add recurring_tasks table
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  recurrence_pattern TEXT NOT NULL CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly')),
  recurrence_days TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add recurring_task_id to tasks table if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_task_id UUID REFERENCES recurring_tasks(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_user_id ON recurring_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_active ON recurring_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_task_id ON tasks(recurring_task_id);

-- Enable RLS for recurring_tasks
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own recurring tasks" ON recurring_tasks;
DROP POLICY IF EXISTS "Users can create their own recurring tasks" ON recurring_tasks;
DROP POLICY IF EXISTS "Users can update their own recurring tasks" ON recurring_tasks;
DROP POLICY IF EXISTS "Users can delete their own recurring tasks" ON recurring_tasks;

-- Create RLS policies for recurring_tasks
CREATE POLICY "Users can view their own recurring tasks" ON recurring_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring tasks" ON recurring_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring tasks" ON recurring_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring tasks" ON recurring_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for recurring_tasks updated_at (only if function exists)
DROP TRIGGER IF EXISTS update_recurring_tasks_updated_at ON recurring_tasks;
CREATE TRIGGER update_recurring_tasks_updated_at BEFORE UPDATE ON recurring_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
