import api from './api';

class GestionAuth {
  async login(email, password) {
    const reponse = await api.post('/login', { email, password });
    const { access_token, user } = reponse.data;

    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;                      // the page reads user.role for redirection
  }

  async register(name, email, password, password_confirmation) {
    const reponse = await api.post('/register', {
      name, email, password, password_confirmation,
    });
    const { access_token, user } = reponse.data;

    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async logout() {
    try {
      await api.post('/logout');      // revoke the token server-side
    } finally {
      localStorage.removeItem('token'); // runs even on 401 / network error
      localStorage.removeItem('user');
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getUser() {
    const brut = localStorage.getItem('user');
    return brut ? JSON.parse(brut) : null;
  }
}

export default new GestionAuth();