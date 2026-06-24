-- Row-Level Security for FitCore Pro multi-tenant isolation
-- Applied after Prisma migrations via seed or manual SQL

-- Enable RLS on all tenant-scoped tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy for users
CREATE POLICY tenant_isolation_users ON public.users
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Tenant isolation policy for roles
CREATE POLICY tenant_isolation_roles ON public.roles
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Tenant isolation policy for user_roles
CREATE POLICY tenant_isolation_user_roles ON public.user_roles
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Tenant isolation policy for gyms
CREATE POLICY tenant_isolation_gyms ON gym.gyms
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Tenant isolation policy for audit_logs
CREATE POLICY tenant_isolation_audit_logs ON public.audit_logs
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Super admin bypass (role = super_admin)
CREATE POLICY super_admin_bypass_users ON public.users
  USING (current_setting('app.current_user_role') = 'super_admin');

CREATE POLICY super_admin_bypass_roles ON public.roles
  USING (current_setting('app.current_user_role') = 'super_admin');

CREATE POLICY super_admin_bypass_user_roles ON public.user_roles
  USING (current_setting('app.current_user_role') = 'super_admin');

CREATE POLICY super_admin_bypass_gyms ON gym.gyms
  USING (current_setting('app.current_user_role') = 'super_admin');

CREATE POLICY super_admin_bypass_audit_logs ON public.audit_logs
  USING (current_setting('app.current_user_role') = 'super_admin');
