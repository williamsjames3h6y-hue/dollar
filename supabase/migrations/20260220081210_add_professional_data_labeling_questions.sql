/*
  # Add Professional Data Labeling Questions to Brand Identification Tasks
  
  1. Schema Changes
    - Adds `question_data` JSONB column to `admin_tasks` table to store multiple questions
    - Updates `user_task_submissions` to store structured answers in JSONB format
    
  2. New Data Structure
    The `question_data` field will contain:
    {
      "questions": [
        {
          "id": "q1",
          "type": "text",
          "label": "Enter the Brand Name",
          "placeholder": "Type the brand name you see in the image",
          "required": true
        },
        {
          "id": "q2",
          "type": "multiple_choice",
          "label": "Which graphical elements are present in this brand image? (Select all that apply)",
          "options": [
            "Abstract Globe",
            "Rising Arrow/Graph",
            "Binary Data Pattern",
            "Currency Symbol ($)",
            "None of the above"
          ],
          "multiple": true,
          "required": true
        },
        {
          "id": "q3",
          "type": "multiple_choice",
          "label": "Based on the visual design, which industry does this brand most likely belong to?",
          "options": [
            "Personal Finance & Banking",
            "Big Data & Analytics",
            "Global Logistics",
            "Real Estate"
          ],
          "required": true
        },
        {
          "id": "q4",
          "type": "yes_no",
          "label": "Look closely at the text. Are all text elements clearly readable and properly formatted?",
          "required": true
        },
        {
          "id": "q5",
          "type": "multiple_choice",
          "label": "Is the logo image clear, or does it appear stretched, blurry, or distorted?",
          "options": [
            "Clear and Professional",
            "Blurry/Low Resolution",
            "Stretched/Distorted",
            "Colors appear faded"
          ],
          "required": true
        }
      ]
    }
    
  3. Security
    - No RLS changes needed (inherits from existing policies)
*/

-- Add question_data column to admin_tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_tasks' AND column_name = 'question_data'
  ) THEN
    ALTER TABLE admin_tasks ADD COLUMN question_data jsonb DEFAULT '{"questions": []}'::jsonb;
  END IF;
END $$;

-- Update user_answer column to be JSONB for structured answers
DO $$
BEGIN
  -- Check if column exists and is text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_task_submissions' 
    AND column_name = 'user_answer' 
    AND data_type = 'text'
  ) THEN
    -- Create new jsonb column
    ALTER TABLE user_task_submissions ADD COLUMN user_answer_json jsonb;
    
    -- Migrate existing text answers to jsonb format
    UPDATE user_task_submissions 
    SET user_answer_json = jsonb_build_object('q1', user_answer);
    
    -- Drop old column
    ALTER TABLE user_task_submissions DROP COLUMN user_answer;
    
    -- Rename new column
    ALTER TABLE user_task_submissions RENAME COLUMN user_answer_json TO user_answer;
  END IF;
END $$;

-- Ensure user_answer is NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_task_submissions' 
    AND column_name = 'user_answer'
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE user_task_submissions ALTER COLUMN user_answer SET DEFAULT '{}'::jsonb;
    ALTER TABLE user_task_submissions ALTER COLUMN user_answer SET NOT NULL;
  END IF;
END $$;

-- Update existing tasks with professional question structure
UPDATE admin_tasks
SET question_data = jsonb_build_object(
  'questions', jsonb_build_array(
    jsonb_build_object(
      'id', 'q1',
      'type', 'text',
      'label', 'Enter the Brand Name',
      'placeholder', 'Type the brand name you see in the image',
      'required', true
    ),
    jsonb_build_object(
      'id', 'q2',
      'type', 'checkbox',
      'label', 'Which graphical elements are present in this brand image? (Select all that apply)',
      'options', jsonb_build_array(
        'Abstract Globe',
        'Rising Arrow/Graph',
        'Binary Data Pattern',
        'Currency Symbol ($)',
        'None of the above'
      ),
      'required', true
    ),
    jsonb_build_object(
      'id', 'q3',
      'type', 'radio',
      'label', 'Based on the visual design, which industry does this brand most likely belong to?',
      'options', jsonb_build_array(
        'Personal Finance & Banking',
        'Big Data & Analytics',
        'Global Logistics',
        'Real Estate'
      ),
      'required', true
    ),
    jsonb_build_object(
      'id', 'q4',
      'type', 'radio',
      'label', 'Look closely at the text. Are all text elements clearly readable and properly formatted?',
      'options', jsonb_build_array('Yes', 'No'),
      'required', true
    ),
    jsonb_build_object(
      'id', 'q5',
      'type', 'radio',
      'label', 'Is the logo image clear, or does it appear stretched, blurry, or distorted?',
      'options', jsonb_build_array(
        'Clear and Professional',
        'Blurry/Low Resolution',
        'Stretched/Distorted',
        'Colors appear faded'
      ),
      'required', true
    )
  )
)
WHERE question_data = '{"questions": []}'::jsonb OR question_data IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_tasks_question_data ON admin_tasks USING gin(question_data);
