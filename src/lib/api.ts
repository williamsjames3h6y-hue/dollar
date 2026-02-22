const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthResponse {
  user: {
    id: number;
    email: string;
    role: string;
    full_name?: string;
    vip_tier?: string;
  };
  session: {
    access_token: string;
  };
}

interface ApiError {
  error: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Network error',
      }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async signUp(email: string, password: string, full_name?: string) {
    const response = await this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
    this.setToken(response.session.access_token);
    return response;
  }

  async signIn(email: string, password: string) {
    const response = await this.request<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.session.access_token);
    return response;
  }

  async signOut() {
    await this.request('/api/auth/signout', { method: 'POST' });
    this.setToken(null);
  }

  async getUser() {
    return this.request<{ user: AuthResponse['user'] }>('/api/auth/user');
  }

  async getTasks() {
    return this.request<any[]>('/api/tasks');
  }

  async submitTask(
    taskId: number,
    data: {
      selected_brand: string;
      confidence_level: string;
      notes?: string;
    }
  ) {
    return this.request(`/api/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTaskStats() {
    return this.request('/api/tasks/stats');
  }

  async getAdminStats() {
    return this.request('/api/admin/stats');
  }

  async getUsers() {
    return this.request<any[]>('/api/admin/users');
  }

  async updateUserRole(userId: number, role: string) {
    return this.request(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: number) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getProducts() {
    return this.request<any[]>('/api/admin/products');
  }

  async createProduct(product: {
    name: string;
    brand: string;
    category: string;
    image_url: string;
    description?: string;
  }) {
    return this.request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(
    productId: number,
    product: {
      name: string;
      brand: string;
      category: string;
      image_url: string;
      description?: string;
    }
  ) {
    return this.request(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(productId: number) {
    return this.request(`/api/admin/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async generateTasks(data: {
    product_id: number;
    quantity: number;
    reward_per_task: number;
  }) {
    return this.request('/api/admin/tasks/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentGateways() {
    return this.request<any[]>('/api/admin/payment-gateways');
  }

  async createPaymentGateway(gateway: any) {
    return this.request('/api/admin/payment-gateways', {
      method: 'POST',
      body: JSON.stringify(gateway),
    });
  }

  async updatePaymentGateway(gatewayId: number, gateway: any) {
    return this.request(`/api/admin/payment-gateways/${gatewayId}`, {
      method: 'PUT',
      body: JSON.stringify(gateway),
    });
  }

  async deletePaymentGateway(gatewayId: number) {
    return this.request(`/api/admin/payment-gateways/${gatewayId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
