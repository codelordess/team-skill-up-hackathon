-- Roles enum + user_roles table (security: roles in separate table)
CREATE TYPE public.app_role AS ENUM ('talent', 'employer', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Talents table
CREATE TABLE public.talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_description TEXT,
  primary_skill TEXT,
  extracted_skills TEXT[] DEFAULT '{}',
  experience_level TEXT,
  credibility_score INT DEFAULT 50,
  proof_links JSONB DEFAULT '[]'::jsonb,
  career_goals TEXT,
  available BOOLEAN DEFAULT true,
  profile_views INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.talents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talents viewable by authenticated users"
  ON public.talents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own talent row"
  ON public.talents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Employers table
CREATE TABLE public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers viewable by authenticated users"
  ON public.employers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own employer row"
  ON public.employers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  location TEXT,
  job_type TEXT DEFAULT 'remote',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs viewable by authenticated users"
  ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employers manage own jobs"
  ON public.jobs FOR ALL
  USING (employer_id IN (SELECT id FROM public.employers WHERE user_id = auth.uid()))
  WITH CHECK (employer_id IN (SELECT id FROM public.employers WHERE user_id = auth.uid()));

-- Profile views (employer interest signal)
CREATE TABLE public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talent sees own profile views"
  ON public.profile_views FOR SELECT USING (auth.uid() = talent_user_id);
CREATE POLICY "Anyone can record a view"
  ON public.profile_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = viewer_user_id);

-- Saved candidates
CREATE TABLE public.saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employer_user_id, talent_user_id)
);

ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employer manages own saved list"
  ON public.saved_candidates FOR ALL
  USING (auth.uid() = employer_user_id) WITH CHECK (auth.uid() = employer_user_id);
CREATE POLICY "Talent sees who saved them"
  ON public.saved_candidates FOR SELECT USING (auth.uid() = talent_user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can create notifications"
  ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, name, email, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'location'
  );

  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'talent');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role);

  IF v_role = 'talent' THEN
    INSERT INTO public.talents (user_id) VALUES (NEW.id);
  ELSIF v_role = 'employer' THEN
    INSERT INTO public.employers (user_id, company_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER talents_touch BEFORE UPDATE ON public.talents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER employers_touch BEFORE UPDATE ON public.employers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();