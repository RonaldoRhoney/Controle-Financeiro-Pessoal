-- Atualiza a função que concede admin automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.assign_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF lower(new.email) = 'rhoneyinc@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;

-- Backfill: se o usuário com o novo email já existe, concede a role admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE lower(email) = 'rhoneyinc@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;