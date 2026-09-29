import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rm_token');
      localStorage.removeItem('rm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  async register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
  async updateMe(data) {
    const res = await api.put('/auth/me', data);
    return res.data;
  },
  logout() {
    localStorage.removeItem('rm_token');
    localStorage.removeItem('rm_user');
  }
};

// ─── Recipes ──────────────────────────────────────────────────────────────────
export const recipeService = {
  async getStatus() {
    try { return (await api.get('/status')).data; }
    catch { return { status: 'offline', database: 'Offline', isMongoConnected: false }; }
  },
  async getRecipes(params = {}) { return (await api.get('/recipes', { params })).data; },
  async getRecipeById(id) { return (await api.get(`/recipes/${id}`)).data; },
  async createRecipe(data) { return (await api.post('/recipes', data)).data; },
  async updateRecipe(id, data) { return (await api.put(`/recipes/${id}`, data)).data; },
  async deleteRecipe(id) { return (await api.delete(`/recipes/${id}`)).data; },
  async getCategories() { return (await api.get('/categories')).data; },
  async getCuisines() { return (await api.get('/cuisines')).data; },
  async resetAndSeed() { return (await api.post('/seed')).data; }
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardService = {
  async get() { return (await api.get('/dashboard')).data; }
};

// ─── Favorites ────────────────────────────────────────────────────────────────
export const favoriteService = {
  async getAll() { return (await api.get('/favorites')).data; },
  async toggle(recipeId) { return (await api.post(`/favorites/${recipeId}`)).data; }
};

// ─── Pantry ───────────────────────────────────────────────────────────────────
export const pantryService = {
  async getAll() { return (await api.get('/pantry')).data; },
  async add(data) { return (await api.post('/pantry', data)).data; },
  async update(id, data) { return (await api.put(`/pantry/${id}`, data)).data; },
  async remove(id) { return (await api.delete(`/pantry/${id}`)).data; }
};

// ─── Meal Plan ────────────────────────────────────────────────────────────────
export const mealPlanService = {
  async getAll() { return (await api.get('/mealplan')).data; },
  async set(recipeId, date, mealType) { return (await api.post('/mealplan', { recipeId, date, mealType })).data; },
  async remove(id) { return (await api.delete(`/mealplan/${id}`)).data; }
};

// ─── Shopping ─────────────────────────────────────────────────────────────────
export const shoppingService = {
  async getAll() { return (await api.get('/shopping')).data; },
  async addItems(items) { return (await api.post('/shopping', items)).data; },
  async update(id, data) { return (await api.put(`/shopping/${id}`, data)).data; },
  async remove(id) { return (await api.delete(`/shopping/${id}`)).data; },
  async clearPurchased() { return (await api.delete('/shopping/clear/purchased')).data; }
};
