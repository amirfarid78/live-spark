
-- Create agency status enum
DO $$ BEGIN
  CREATE TYPE agency_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Agencies table
CREATE TABLE public.agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  commission_rate NUMERIC NOT NULL DEFAULT 15.00,
  total_revenue NUMERIC NOT NULL DEFAULT 0.00,
  total_creators INTEGER NOT NULL DEFAULT 0,
  status agency_status NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agency applications table
CREATE TABLE public.agency_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agency_name TEXT NOT NULL,
  description TEXT,
  experience TEXT,
  creator_count INTEGER DEFAULT 0,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  social_links JSONB DEFAULT '{}',
  status agency_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agency members table
CREATE TABLE public.agency_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'creator',
  commission_split NUMERIC NOT NULL DEFAULT 70.00,
  total_earnings NUMERIC NOT NULL DEFAULT 0.00,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(agency_id, user_id)
);

-- Enable RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;

-- Agencies policies
CREATE POLICY "Agencies are viewable by everyone" ON public.agencies FOR SELECT USING (true);
CREATE POLICY "Owners can update their agency" ON public.agencies FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can create agencies" ON public.agencies FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Agency applications policies
CREATE POLICY "Users can view own applications" ON public.agency_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create applications" ON public.agency_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending applications" ON public.agency_applications FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Agency members policies
CREATE POLICY "Members can view their own membership" ON public.agency_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Agency owners can view their members" ON public.agency_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.agencies WHERE agencies.id = agency_members.agency_id AND agencies.owner_id = auth.uid()));
CREATE POLICY "Agency owners can add members" ON public.agency_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.agencies WHERE agencies.id = agency_members.agency_id AND agencies.owner_id = auth.uid()));
CREATE POLICY "Agency owners can update members" ON public.agency_members FOR UPDATE USING (EXISTS (SELECT 1 FROM public.agencies WHERE agencies.id = agency_members.agency_id AND agencies.owner_id = auth.uid()));
CREATE POLICY "Agency owners can remove members" ON public.agency_members FOR DELETE USING (EXISTS (SELECT 1 FROM public.agencies WHERE agencies.id = agency_members.agency_id AND agencies.owner_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agency_applications_updated_at BEFORE UPDATE ON public.agency_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
