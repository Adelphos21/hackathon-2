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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://198.211.105.95:8080';

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

// Función helper para manejar respuestas
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    throw new Error(`Error ${response.status}: ${errorText || 'Error en la solicitud'}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

// Servicios de autenticación
export const authService = {
  async register(data: RegisterRequest): Promise<void> {
    console.log('Registrando usuario:', data.email);
    const response = await fetch(`${API_BASE_URL}/authentication/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    await handleResponse(response);
  },

  async login(data: LoginRequest): Promise<any> {
    console.log('Iniciando sesión:', data.email);
    const response = await fetch(`${API_BASE_URL}/authentication/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await handleResponse(response);
    // Ajuste para estructura real del backend: result.result.token y result.result.username
    if (result && result.result && result.result.token) {
      localStorage.setItem('token', result.result.token);
      localStorage.setItem('email', result.result.username); // Guardamos username como email
      console.log('Token guardado correctamente');
    } else {
      console.error('Respuesta inesperada del backend al hacer login:', result);
      throw new Error('No se recibió un token válido del backend.');
    }
    
    return result;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    console.log('Sesión cerrada');
  }
};

// Servicios de gastos
export const expenseService = {
  async getSummary(year?: number, month?: number): Promise<ExpenseSummary[]> {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());

  console.log('Obteniendo resumen de gastos:', { year, month });
  const response = await fetch(`${API_BASE_URL}/expenses_summary?${params}`, {
    headers: getAuthHeaders()
  });

  const rawData = await handleResponse(response);

  // Agrupar por categoría
  const groupedMap = new Map<number, ExpenseSummary>();

  rawData.forEach((item: any) => {
    // Asegura que coincidan año y mes si se están filtrando
    if ((year && item.year !== year) || (month && item.month !== month)) return;

    const catId = item.expenseCategory.id;
    const catName = item.expenseCategory.name;
    const amount = Number(item.amount) || 0;

    if (groupedMap.has(catId)) {
      groupedMap.get(catId)!.totalAmount += amount;
    } else {
      groupedMap.set(catId, {
        categoryId: catId,
        categoryName: catName,
        totalAmount: amount
      });
    }
  });

  return Array.from(groupedMap.values());
},

  async getDetails(year: number, month: number, categoryId: number): Promise<ExpenseDetail[]> {
    console.log('Obteniendo detalles de gastos:', { year, month, categoryId });
    const response = await fetch(
      `${API_BASE_URL}/expenses/detail?year=${year}&month=${month}&categoryId=${categoryId}`,
      { headers: getAuthHeaders() }
    );
    
    return handleResponse(response);
  },

  async create(expense: ExpenseCreate): Promise<ExpenseDetail> {
    console.log('Creando gasto:', expense);
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(expense)
    });
    
    return handleResponse(response);
  },

  async delete(id: number): Promise<void> {
    console.log('Eliminando gasto:', id);
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    await handleResponse(response);
  }
};

// Servicios de categorías
export const categoryService = {
  async getAll(): Promise<Category[]> {
    console.log('Obteniendo categorías');
    const response = await fetch(`${API_BASE_URL}/expenses_category`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// Servicios de metas
export const goalService = {
  async getAll(): Promise<Goal[]> {
    console.log('Obteniendo metas');
    const response = await fetch(`${API_BASE_URL}/goals`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async create(goal: GoalCreate): Promise<Goal> {
    console.log('Creando meta:', goal);
    const response = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(goal)
    });
    
    return handleResponse(response);
  },

  async update(id: number, goal: Partial<GoalCreate>): Promise<Goal> {
    console.log('Actualizando meta:', id, goal);
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(goal)
    });
    
    return handleResponse(response);
  }
};