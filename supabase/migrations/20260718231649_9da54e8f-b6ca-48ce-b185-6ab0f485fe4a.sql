CREATE POLICY "access_logs_no_update" ON public.access_logs FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "access_logs_no_delete" ON public.access_logs FOR DELETE TO authenticated USING (false);
REVOKE UPDATE, DELETE ON public.access_logs FROM authenticated, anon;