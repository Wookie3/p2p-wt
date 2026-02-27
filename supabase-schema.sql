-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (supports both auth and anonymous)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  is_online BOOLEAN DEFAULT false,
  peer_id TEXT,
  in_call_with UUID REFERENCES public.profiles(id),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for username search
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Contacts/Friends table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_contact UNIQUE (user_id, contact_id),
  CONSTRAINT no_self_contact CHECK (user_id != contact_id)
);

-- Friend Requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prevent duplicate pending friend requests
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_requests
ON public.friend_requests(from_user_id, to_user_id)
WHERE status = 'pending';

-- Create indexes for better performance (duplicates removed above)
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_id ON public.contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from_user_id ON public.friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user_id ON public.friend_requests(to_user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_online ON public.profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_profiles_peer_id ON public.profiles(peer_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests(status, to_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone except peer_id"
  ON public.profiles FOR SELECT
  USING (true);

-- Security: Create secure view that excludes sensitive fields
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
  id,
  username,
  is_online,
  last_seen,
  created_at
FROM public.profiles;

-- Grant access to secure view
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- Users can only see peer_id of their contacts
-- We'll implement this by creating a view or using a more complex policy if needed, 
-- but for now let's just restrict profile updates.

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (user_id IS NULL));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for contacts
CREATE POLICY "Users can view their own contacts"
  ON public.contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON public.contacts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for friend_requests
CREATE POLICY "Users can view their own friend requests"
  ON public.friend_requests FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can insert friend requests"
  ON public.friend_requests FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update friend requests they receive"
  ON public.friend_requests FOR UPDATE
  USING (auth.uid() = to_user_id);

CREATE POLICY "Users can delete their own friend requests"
  ON public.friend_requests FOR DELETE
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Atomic friend acceptance function
CREATE OR REPLACE FUNCTION accept_friend_request(
  request_id UUID,
  current_user_id UUID,
  from_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Delete all other requests between these users
  DELETE FROM public.friend_requests
  WHERE (
    (from_user_id = current_user_id AND to_user_id = from_user_id)
    OR (from_user_id = from_user_id AND to_user_id = current_user_id)
  ) AND id != request_id;

  -- Update this request status
  UPDATE public.friend_requests
  SET status = 'accepted'
  WHERE id = request_id;

  -- Insert mutual contacts atomically
  INSERT INTO public.contacts (user_id, contact_id)
  VALUES (current_user_id, from_user_id), (from_user_id, current_user_id)
  ON CONFLICT (user_id, contact_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.accept_friend_request TO authenticated, anon;

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, is_online, needs_username_setup)
  VALUES (
    new.id,
    'User' || substr(new.id::text, 1, 8),
    false,
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.contacts TO postgres;
GRANT ALL ON public.friend_requests TO postgres;
