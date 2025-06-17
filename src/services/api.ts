import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ExpenseSummary, 
  ExpenseDetail, 
  ExpenseCreate, 
  Category, 
  Goal, 
  GoalCreate 
} from '../types';

const API_BASE_URL = 'http://198.211.105.95:8080';

// Función para obtener el token del localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Función para crear headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Servicios de autenticación
export const authService = {
  async register(data: RegisterRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/authentication/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Error en el registro');
    }
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/authentication/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Error en el login');
    }
    
    const result: LoginResponse = await response.json();
    
    // Guardar token en localStorage
    if (result.data.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('email', result.data.email);
    }
    
    return result;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
  }
};

// Servicios de gastos
export const expenseService = {
  async getSummary(year?: number, month?: number): Promise<ExpenseSummary[]> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const response = await fetch(`${API_BASE_URL}/expenses_summary?${params}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener resumen de gastos');
    }
    
    return response.json();
  },

  async getDetails(year: number, month: number, categoryId: number): Promise<ExpenseDetail[]> {
    const response = await fetch(
      `${API_BASE_URL}/expenses/detail?year=${year}&month=${month}&categoryId=${categoryId}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener detalles de gastos');
    }
    
    return response.json();
  },

  async create(expense: ExpenseCreate): Promise<ExpenseDetail> {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(expense)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear gasto');
    }
    
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar gasto');
    }
  }
};

// Servicios de categorías
export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/expenses_category`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener categorías');
    }
    
    return response.json();
  }
};

// Servicios de metas
export const goalService = {
  async getAll(): Promise<Goal[]> {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener metas');
    }
    
    return response.json();
  },

  async create(goal: GoalCreate): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(goal)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear meta');
    }
    
    return response.json();
  },

  async update(id: number, goal: Partial<GoalCreate>): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(goal)
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar meta');
    }
    
    return response.json();
  }
};