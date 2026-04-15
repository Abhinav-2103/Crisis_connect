import { supabaseUrl, supabaseKey } from '/utils/supabase/info';

const API_BASE = `${supabaseUrl}/functions/v1/make-server-17668ba8`;

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// ==================== AUTH API ====================

export const authApi = {
  async login(email: string, password: string) {
    return apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  async signup(email: string, password: string, name: string, role: string) {
    return apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name, role }) });
  },
};

// ==================== NGO API ====================

export const ngosApi = {
  async getAll() {
    return apiRequest('/ngos');
  },
  async create(ngoData: { name: string; city: string; state: string; phone?: string; email?: string; description?: string }) {
    return apiRequest('/ngos', { method: 'POST', body: JSON.stringify(ngoData) });
  },
};

// ==================== NEEDS API ====================

export const needsApi = {
  async getAll(filters?: { category?: string; status?: string; userId?: string; ngoId?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.ngoId) params.append('ngoId', filters.ngoId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/needs${query}`);
  },
  async create(needData: {
    title: string; description: string; category: string; location: string;
    urgency: string; userId: string; userName: string; userPhone?: string; ngoId?: string; ngoName?: string;
  }) {
    return apiRequest('/needs', { method: 'POST', body: JSON.stringify(needData) });
  },
  async update(id: string, updates: Partial<any>) {
    return apiRequest(`/needs/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  },
  async delete(id: string) {
    return apiRequest(`/needs/${id}`, { method: 'DELETE' });
  },
};

// ==================== VOLUNTEERS API ====================

export const volunteersApi = {
  async getAll(filters?: { ngoId?: string }) {
    const params = new URLSearchParams();
    if (filters?.ngoId) params.append('ngoId', filters.ngoId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/volunteers${query}`);
  },
  async createOrUpdate(volunteerData: any) {
    return apiRequest('/volunteers', { method: 'POST', body: JSON.stringify(volunteerData) });
  },
};

// ==================== CHAT API ====================

export const chatApi = {
  async getMessages(conversationId: string) {
    return apiRequest(`/chat/${conversationId}`);
  },
  async sendMessage(conversationId: string, senderId: string, text: string) {
    return apiRequest('/chat', { method: 'POST', body: JSON.stringify({ conversationId, senderId, text }) });
  },
};

// ==================== ANALYTICS API ====================

export const analyticsApi = {
  async getDashboard() {
    return apiRequest('/analytics/dashboard');
  },
  async getLeaderboard() {
    return apiRequest('/analytics/leaderboard');
  },
};

// ==================== INITIALIZATION ====================

export const initApi = {
  async initDemoData(force = false) {
    return apiRequest('/init-demo-data', { method: 'POST', body: JSON.stringify({ force }) });
  },
};
