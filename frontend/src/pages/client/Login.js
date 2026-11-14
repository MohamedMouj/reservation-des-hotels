import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GestionAuth from '../../services/Auth';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setErreur('');

    try {
      const user = await GestionAuth.login(email, password);

      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setErreur('Email ou mot de passe incorrect.');
    }
  }

  return (
    <main>
      <h1>Connexion</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Adresse e-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {erreur && <p role="alert">{erreur}</p>}

        <button type="submit">Se connecter</button>
      </form>
    </main>
  );
}

export default Login;