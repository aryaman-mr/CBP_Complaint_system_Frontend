const API_BASE = '/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      if (error.name === 'SyntaxError') {
        throw new Error('Server returned invalid response');
      }
      throw error;
    }
  },

  auth: {
    login: (credentials) => api.request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => api.request('/auth/register', { method: 'POST', body: userData })
  },

  complaints: {
    create: (formData) => {
      const token = localStorage.getItem('token');
      return fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }).then(async response => {
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to create complaint');
        }
        return response.json();
      });
    },
    getMy: () => api.request('/complaints/my-complaints'),
    getAll: () => api.request('/complaints/all'),
    updateStatus: (id, status) => api.request(`/complaints/${id}/status`, { 
      method: 'PUT', 
      body: { status } 
    })
  }
};

const auth = {
  isLoggedIn: () => !!localStorage.getItem('token'),
  getUser: () => JSON.parse(localStorage.getItem('user') || '{}'),
  isAdmin: () => auth.getUser().role === 'admin',
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }
};

const utils = {
  showMessage: (message, type = 'info') => {
    const div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.textContent = message;
    div.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 1000;
      padding: 15px; border-radius: 5px; color: white;
      background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  },

  formatDate: (date) => new Date(date).toLocaleDateString(),
  
  redirect: (page) => window.location.href = page
};