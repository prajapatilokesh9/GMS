import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        localStorage.setItem('accessToken', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
  };
  accessToken: string;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', { email, password });
  return data.data;
}

export async function register(payload: { email: string; password: string; fullName: string; phone?: string }) {
  const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', payload);
  return data.data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token: string, password: string) {
  const { data } = await api.post<{ success: boolean; message: string }>('/auth/reset-password', { token, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get<{ success: boolean; data: AuthResponse['user'] }>('/auth/me');
  return data.data;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const { data } = await api.put<{ success: boolean; message: string }>('/users/me/change-password', { oldPassword, newPassword });
  return data;
}

export async function getLoginHistory(page = 1, limit = 20) {
  const { data } = await api.get('/auth/login-history', { params: { page, limit } });
  return data.data;
}

export async function getGyms(page = 1, limit = 20) {
  const { data } = await api.get('/gyms', { params: { page, limit } });
  return data.data;
}

export async function getGymById(id: string) {
  const { data } = await api.get(`/gyms/${id}`);
  return data.data;
}

export async function updateGymOnboardingStatus(id: string, onboardingStatus: string, rejectionReason?: string) {
  const { data } = await api.patch(`/gyms/${id}/verify`, { onboardingStatus, rejectionReason });
  return data.data;
}

export async function getGymDocuments(gymId: string) {
  const { data } = await api.get(`/gyms/${gymId}/documents`);
  return data.data;
}

export async function updateDocumentStatus(gymId: string, docId: string, status: string) {
  const { data } = await api.patch(`/gyms/${gymId}/documents/${docId}/status`, { status });
  return data.data;
}

export async function getGymStaff(gymId: string) {
  const { data } = await api.get(`/gyms/${gymId}/staff`);
  return data.data;
}

// ---- Billing API ----

export async function getBillingPlans(gymId: string) {
  const { data } = await api.get(`/billing/gyms/${gymId}/plans`);
  return data.data;
}

export async function getBillingPlan(planId: string) {
  const { data } = await api.get(`/billing/plans/${planId}`);
  return data.data;
}

export async function createBillingPlan(payload: {
  gymId: string;
  name: string;
  type: string;
  description?: string;
  priceAmount: number;
  currency?: string;
  durationDays?: number;
  sessionsIncluded?: number;
  features?: Record<string, unknown>;
  autoRenew?: boolean;
}) {
  const { data } = await api.post(`/billing/gyms/${payload.gymId}/plans`, payload);
  return data.data;
}

export async function updateBillingPlan(planId: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/billing/plans/${planId}`, payload);
  return data.data;
}

export async function getBillingMemberships(gymId: string) {
  const { data } = await api.get(`/billing/gyms/${gymId}/memberships`);
  return data.data;
}

export async function getBillingMembership(membershipId: string) {
  const { data } = await api.get(`/billing/memberships/${membershipId}`);
  return data.data;
}

export async function createBillingMembership(payload: {
  gymId: string;
  customerId: string;
  planId?: string;
  startDate: string;
  endDate?: string;
  pricePaid: number;
  paymentMethod?: string;
  autoRenew?: boolean;
}) {
  const { data } = await api.post(`/billing/gyms/${payload.gymId}/memberships`, payload);
  return data.data;
}

export async function renewBillingMembership(membershipId: string) {
  const { data } = await api.post(`/billing/memberships/${membershipId}/renew`);
  return data.data;
}

export async function updateBillingMembership(membershipId: string, payload: { status?: string; autoRenew?: boolean }) {
  const { data } = await api.patch(`/billing/memberships/${membershipId}`, payload);
  return data.data;
}

export async function topUpWallet(membershipId: string, amount: number) {
  const { data } = await api.post(`/billing/memberships/${membershipId}/wallet/topup`, { amount });
  return data.data;
}

export async function getBillingPayments(params?: { page?: number; limit?: number }) {
  const { data } = await api.get('/billing/payments', { params });
  return data.data;
}

export async function getBillingPayment(paymentId: string) {
  const { data } = await api.get(`/billing/payments/${paymentId}`);
  return data.data;
}

// ---- Supplement API ----

export async function getSupplementCompanies() {
  const { data } = await api.get('/supplements/companies');
  return data.data;
}

export async function getSupplementCompany(companyId: string) {
  const { data } = await api.get(`/supplements/companies/${companyId}`);
  return data.data;
}

export async function createSupplementCompany(payload: { name: string; slug: string; email?: string; phone?: string; address?: string; city?: string; state?: string; pincode?: string; logoUrl?: string }) {
  const { data } = await api.post('/supplements/companies', payload);
  return data.data;
}

export async function updateSupplementCompany(companyId: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/supplements/companies/${companyId}`, payload);
  return data.data;
}

export async function getSupplements() {
  const { data } = await api.get('/supplements');
  return data.data;
}

export async function getSupplement(supplementId: string) {
  const { data } = await api.get(`/supplements/${supplementId}`);
  return data.data;
}

export async function createSupplement(payload: { companyId: string; name: string; slug: string; category: string; description?: string; price: number; mrp: number; unit?: string; unitValue?: string; stock?: number; images?: string[]; isActive?: boolean }) {
  const { data } = await api.post('/supplements', payload);
  return data.data;
}

export async function updateSupplement(supplementId: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/supplements/${supplementId}`, payload);
  return data.data;
}

export async function getSupplementOrders() {
  const { data } = await api.get('/supplements/orders');
  return data.data;
}

export async function getSupplementOrder(orderId: string) {
  const { data } = await api.get(`/supplements/orders/${orderId}`);
  return data.data;
}

export async function updateSupplementOrder(orderId: string, payload: { status?: string; trackingId?: string; returnReason?: string }) {
  const { data } = await api.patch(`/supplements/orders/${orderId}`, payload);
  return data.data;
}

// ---- Trainer API ----

export async function getTrainers(filters?: { gymId?: string; isActive?: boolean }) {
  const params = new URLSearchParams();
  if (filters?.gymId) params.set('gymId', filters.gymId);
  if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
  const qs = params.toString();
  const { data } = await api.get(`/trainers${qs ? `?${qs}` : ''}`);
  return data.data;
}

export async function getTrainer(trainerId: string) {
  const { data } = await api.get(`/trainers/${trainerId}`);
  return data.data;
}

export async function createTrainer(payload: { userId: string; gymId: string; specialization?: string; certifications?: { name: string; issuer?: string; year?: number }[]; bio?: string }) {
  const { data } = await api.post('/trainers', payload);
  return data.data;
}

export async function updateTrainer(trainerId: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/trainers/${trainerId}`, payload);
  return data.data;
}

// ---- Users API ----

export async function getUsers() {
  const { data } = await api.get('/users');
  return data.data;
}

// ---- PT Packages API ----

export async function getPtPackages(filters?: { gymId?: string; isActive?: boolean }) {
  const params = new URLSearchParams();
  if (filters?.gymId) params.set('gymId', filters.gymId);
  if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
  const qs = params.toString();
  const { data } = await api.get(`/pt-packages${qs ? `?${qs}` : ''}`);
  return data.data;
}

export async function getPtPackage(packageId: string) {
  const { data } = await api.get(`/pt-packages/${packageId}`);
  return data.data;
}

export async function createPtPackage(payload: { name: string; description?: string; totalSessions: number; price: number; validityDays: number; gymId?: string; isActive?: boolean }) {
  const { data } = await api.post('/pt-packages', payload);
  return data.data;
}

export async function updatePtPackage(packageId: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/pt-packages/${packageId}`, payload);
  return data.data;
}

// ---- PT Sessions API ----

export async function getPtSessions(filters?: { trainerId?: string; clientId?: string; status?: string; gymId?: string }) {
  const params = new URLSearchParams();
  if (filters?.trainerId) params.set('trainerId', filters.trainerId);
  if (filters?.clientId) params.set('clientId', filters.clientId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.gymId) params.set('gymId', filters.gymId);
  const qs = params.toString();
  const { data } = await api.get(`/pt-sessions${qs ? `?${qs}` : ''}`);
  return data.data;
}

export async function getPtSession(sessionId: string) {
  const { data } = await api.get(`/pt-sessions/${sessionId}`);
  return data.data;
}

export async function createPtSession(payload: { trainerId: string; clientId: string; packageId?: string; gymId?: string; scheduledAt: string; notes?: string }) {
  const { data } = await api.post('/pt-sessions', payload);
  return data.data;
}

export async function updatePtSession(sessionId: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/pt-sessions/${sessionId}`, payload);
  return data.data;
}

export async function checkInPtSession(sessionId: string) {
  const { data } = await api.post(`/pt-sessions/${sessionId}/check-in`);
  return data.data;
}

export async function completePtSession(sessionId: string) {
  const { data } = await api.post(`/pt-sessions/${sessionId}/complete`);
  return data.data;
}

export async function cancelPtSession(sessionId: string) {
  const { data } = await api.post(`/pt-sessions/${sessionId}/cancel`);
  return data.data;
}

// ---- Commission API ----

export async function getCommissionRules(filters?: { gymId?: string; trainerId?: string; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.gymId) params.set('gymId', filters.gymId);
  if (filters?.trainerId) params.set('trainerId', filters.trainerId);
  if (filters?.status) params.set('status', filters.status);
  const qs = params.toString();
  const { data } = await api.get(`/commissions/rules${qs ? `?${qs}` : ''}`);
  return data.data;
}

export async function getCommissionRule(ruleId: string) {
  const { data } = await api.get(`/commissions/rules/${ruleId}`);
  return data.data;
}

export async function createCommissionRule(payload: {
  gymId: string; commissionType: 'fixed' | 'percentage'; commissionValue: number; effectiveFrom: string; effectiveTo?: string; trainerId?: string;
}) {
  const { data } = await api.post('/commissions/rules', payload);
  return data.data;
}

export async function updateCommissionRule(ruleId: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/commissions/rules/${ruleId}`, payload);
  return data.data;
}

export async function activateCommissionRule(ruleId: string) {
  const { data } = await api.post(`/commissions/rules/${ruleId}/activate`);
  return data.data;
}

export async function deactivateCommissionRule(ruleId: string) {
  const { data } = await api.post(`/commissions/rules/${ruleId}/deactivate`);
  return data.data;
}

export async function getCommissionPayouts(filters?: { trainerId?: string; payoutStatus?: string }) {
  const params = new URLSearchParams();
  if (filters?.trainerId) params.set('trainerId', filters.trainerId);
  if (filters?.payoutStatus) params.set('payoutStatus', filters.payoutStatus);
  const qs = params.toString();
  const { data } = await api.get(`/commissions/payouts${qs ? `?${qs}` : ''}`);
  return data.data;
}

export async function getCommissionPayout(payoutId: string) {
  const { data } = await api.get(`/commissions/payouts/${payoutId}`);
  return data.data;
}

export async function generateCommissionPayout(payload: { sessionId: string; grossAmount: number }) {
  const { data } = await api.post('/commissions/payouts/generate', payload);
  return data.data;
}

export async function approveCommissionPayout(payoutId: string) {
  const { data } = await api.post(`/commissions/payouts/${payoutId}/approve`);
  return data.data;
}

export async function markPaidCommissionPayout(payoutId: string, payload?: { paymentReference?: string; payoutDate?: string }) {
  const { data } = await api.post(`/commissions/payouts/${payoutId}/mark-paid`, payload || {});
  return data.data;
}

// ---- Equipment Catalogue API ----

export async function getEquipmentCatalogues(filters?: { category?: string; brand?: string; isActive?: string; includeInactive?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.brand) params.set('brand', filters.brand);
  if (filters?.isActive !== undefined) params.set('isActive', filters.isActive);
  if (filters?.includeInactive) params.set('includeInactive', filters.includeInactive);
  const qs = params.toString();
  const { data } = await api.get(`/equipment/catalogue${qs ? `?${qs}` : ''}`);
  return data.data;
}

export async function getEquipmentCatalogue(id: string) {
  const { data } = await api.get(`/equipment/catalogue/${id}`);
  return data.data;
}

export async function createEquipmentCatalogue(payload: {
  name: string;
  sku: string;
  brand: string;
  model: string;
  category: string;
  subcategory?: string;
  specs?: Record<string, unknown>;
  unitCost: number;
  warrantyMonths?: number;
}) {
  const { data } = await api.post('/equipment/catalogue', payload);
  return data.data;
}

export async function updateEquipmentCatalogue(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/equipment/catalogue/${id}`, payload);
  return data.data;
}

export async function deleteEquipmentCatalogue(id: string) {
  const { data } = await api.delete(`/equipment/catalogue/${id}`);
  return data.data;
}

export async function restoreEquipmentCatalogue(id: string) {
  const { data } = await api.post(`/equipment/catalogue/${id}/restore`);
  return data.data;
}

// ---- Equipment Inventory API ----
export async function getEquipmentInventoryItems(filters?: { gymId?: string; catalogueItemId?: string; status?: string; includeInactive?: string }) {
  const params = new URLSearchParams();
  if (filters?.gymId) params.set('gymId', filters.gymId);
  if (filters?.catalogueItemId) params.set('catalogueItemId', filters.catalogueItemId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.includeInactive) params.set('includeInactive', filters.includeInactive);
  const qs = params.toString();
  const { data } = await api.get(`/equipment/inventory${qs ? `?${qs}` : ''}`);
  return data.data;
}

export async function getEquipmentInventoryItem(id: string) {
  const { data } = await api.get(`/equipment/inventory/${id}`);
  return data.data;
}

export async function createEquipmentInventoryItem(payload: {
  catalogueItemId: string;
  serialNumber: string;
  gymId: string;
  purchaseDate: string;
  purchaseCost?: number;
  supplier?: string;
  location?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  maintenanceIntervalMonths?: number;
  status?: string;
  notes?: string;
}) {
  const { data } = await api.post('/equipment/inventory', payload);
  return data.data;
}

export async function updateEquipmentInventoryItem(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/equipment/inventory/${id}`, payload);
  return data.data;
}

export async function deleteEquipmentInventoryItem(id: string) {
  const { data } = await api.delete(`/equipment/inventory/${id}`);
  return data.data;
}

export async function restoreEquipmentInventoryItem(id: string) {
  const { data } = await api.post(`/equipment/inventory/${id}/restore`);
  return data.data;
}

// ---- Equipment Maintenance Jobs API ----
export async function getMaintenanceJobs(filters?: {
  status?: string; inventoryId?: string; assignedTo?: string;
  type?: string; scheduledDateFrom?: string; scheduledDateTo?: string;
  includeInactive?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.inventoryId) params.set('inventoryId', filters.inventoryId);
  if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.scheduledDateFrom) params.set('scheduledDateFrom', filters.scheduledDateFrom);
  if (filters?.scheduledDateTo) params.set('scheduledDateTo', filters.scheduledDateTo);
  if (filters?.includeInactive) params.set('includeInactive', filters.includeInactive);
  const qs = params.toString();
  const { data } = await api.get(`/equipment/maintenance-jobs${qs ? `?${qs}` : ''}`);
  return data.data;
}

export async function getMaintenanceJob(id: string) {
  const { data } = await api.get(`/equipment/maintenance-jobs/${id}`);
  return data.data;
}

export async function createMaintenanceJob(payload: {
  inventoryId: string;
  scheduledDate: string;
  type?: string;
  assignedTo?: string;
  assignedTechnicianName?: string;
  description?: string;
  estimatedCost?: number;
}) {
  const { data } = await api.post('/equipment/maintenance-jobs', payload);
  return data.data;
}

export async function updateMaintenanceJob(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/equipment/maintenance-jobs/${id}`, payload);
  return data.data;
}

export async function deleteMaintenanceJob(id: string) {
  const { data } = await api.delete(`/equipment/maintenance-jobs/${id}`);
  return data.data;
}

export async function restoreMaintenanceJob(id: string) {
  const { data } = await api.post(`/equipment/maintenance-jobs/${id}/restore`);
  return data.data;
}
