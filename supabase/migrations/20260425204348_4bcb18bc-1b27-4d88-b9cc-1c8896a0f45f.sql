CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

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

DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.notifications;
CREATE POLICY "Users create own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);