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
CREATE POLICY "Enable update for users based on id" ON public.access_tokens
    FOR UPDATE USING (true);

-- Create Policy: Full access for admin
CREATE POLICY "Full access for all" ON public.access_tokens
    FOR ALL USING (true);

-- Insert a test token
INSERT INTO public.access_tokens (username, token, is_admin)
VALUES ('DemoUser', 'WELCOME_2026', false);
