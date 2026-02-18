import { AuthResponse, User, Food, Meal, Workout, DayStats } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Si 401, essayer de rafraîchir le token
    if (response.status === 401 && this.refreshToken && endpoint !== '/auth/refresh') {
      try {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Réessayer la requête avec le nouveau token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      } catch (error) {
        // Refresh échoué, déconnexion
        this.logout();
        throw new Error('Session expirée');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || `Erreur ${response.status}`);
    }

    return response.json();
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data: { accessToken: string } = await response.json();
      this.setTokens(this.accessToken!, data.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Auth
  async register(email: string, password: string): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  // Users
  async getMe(): Promise<User> {
    return this.request<User>('/me');
  }

  // Foods
  async searchFoods(query?: string, limit = 20): Promise<Food[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    params.append('limit', limit.toString());
    return this.request<Food[]>(`/foods?${params}`);
  }

  async createFood(food: {
    name: string;
    brand?: string;
    kcal100g: number;
    protein100g: number;
    carbs100g: number;
    fat100g: number;
  }): Promise<Food> {
    return this.request<Food>('/foods', {
      method: 'POST',
      body: JSON.stringify(food),
    });
  }

  // Meals
  async createMeal(meal: {
    eatenAt: string;
    mealType: string;
    note?: string;
  }): Promise<Meal> {
    return this.request<Meal>('/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    });
  }

  async addMealItem(mealId: string, item: { foodId: string; grams: number }): Promise<any> {
    return this.request(`/meals/${mealId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async getMeals(date?: string): Promise<{ meals: Meal[]; totals: any }> {
    const params = date ? `?date=${date}` : '';
    return this.request<{ meals: Meal[]; totals: any }>(`/meals${params}`);
  }

  // Workouts
  async createWorkout(workout: {
    startedAt: string;
    type: 'run' | 'strength';
    durationMin: number;
    rpe?: number;
    notes?: string;
    distanceKm?: number;
    avgPaceSecKm?: number;
  }): Promise<Workout> {
    return this.request<Workout>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
  }

  async getWorkouts(from?: string, to?: string): Promise<Workout[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params}` : '';
    return this.request<Workout[]>(`/workouts${query}`);
  }

  // Stats
  async getDayStats(date?: string): Promise<DayStats> {
    const params = date ? `?date=${date}` : '';
    return this.request<DayStats>(`/stats/day${params}`);
  }
}

export const apiClient = new ApiClient();
