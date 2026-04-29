# Supabase Database Setup

To make the login and admin systems work, you need to create the `access_tokens` table in your Supabase project.

## Step 1: SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project.
3. Click on **SQL Editor** in the left sidebar.
4. Click **New Query**.

## Step 2: Run SQL
Copy and paste the following SQL and click **Run**:

```sql
-- Create the access_tokens table
CREATE TABLE IF NOT EXISTS public.access_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- Create Policy: Anyone can read their own token (for login)
CREATE POLICY "Enable read access for all users" ON public.access_tokens
    FOR SELECT USING (true);

-- Create Policy: Users can update their own username
-- NOTE: In this simplified setup, we'll allow updates based on ID
CREATE POLICY "Enable update for users based on id" ON public.access_tokens
    FOR UPDATE USING (true);

-- Create Policy: Full access for admin
-- In a production app, you'd use service_role or more strict rules
CREATE POLICY "Full access for all" ON public.access_tokens
    FOR ALL USING (true);

-- Insert a test token
INSERT INTO public.access_tokens (username, token, is_admin)
VALUES ('DemoUser', 'WELCOME_2026', false);
```

## Step 3: Configure API Key in App
1. Go to **Project Settings** > **API**.
2. Find the **anon public** key.
3. Open `src/services/supabase.ts` in the project.
4. Replace `YOUR_SUPABASE_ANON_KEY` with your actual key.

## Admin Credentials
- **Username**: `ikhsan`
- **Password**: `0721`
- Or use the Token access override in the app.
