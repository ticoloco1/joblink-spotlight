
-- Add status to profiles (active, disabled, blocked, suspended)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Profile admin actions log
CREATE TABLE public.profile_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  reason text,
  previous_status text,
  new_status text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage profile actions" ON public.profile_actions FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Function to change profile status with logging
CREATE OR REPLACE FUNCTION public.admin_change_profile_status(
  _profile_id uuid,
  _admin_user_id uuid,
  _action text,
  _new_status text,
  _reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _previous_status text;
BEGIN
  IF NOT public.is_admin(_admin_user_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT status INTO _previous_status FROM public.profiles WHERE id = _profile_id;
  IF _previous_status IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  UPDATE public.profiles SET status = _new_status, updated_at = now() WHERE id = _profile_id;

  -- If blocking/disabling, also unpublish
  IF _new_status IN ('blocked', 'disabled', 'suspended') THEN
    UPDATE public.profiles SET is_published = false WHERE id = _profile_id;
  END IF;

  -- If recovering/enabling, republish
  IF _new_status = 'active' THEN
    UPDATE public.profiles SET is_published = true WHERE id = _profile_id;
  END IF;

  INSERT INTO public.profile_actions (profile_id, admin_user_id, action, reason, previous_status, new_status)
  VALUES (_profile_id, _admin_user_id, _action, _reason, _previous_status, _new_status);

  RETURN jsonb_build_object('ok', true, 'previous_status', _previous_status, 'new_status', _new_status);
END;
$$;
