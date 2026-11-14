import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GestionAuth from '../../services/Auth';

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [erreur, setErreur] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setErreur('');

    if (password !== passwordConfirmation) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const user = await GestionAuth.register(
        name,
        email,
        password,
        passwordConfirmation
      );

      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.message;
      setErreur(message || 'Inscription impossible. Vérifiez les informations saisies.');
    }
  }

  return (
    <main>
      <h1>Créer un compte</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nom</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

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

        <div>
          <label htmlFor="passwordConfirmation">Confirmer le mot de passe</label>
          <input
            id="passwordConfirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
          />
        </div>

        {erreur && <p role="alert">{erreur}</p>}

        <button type="submit">Créer mon compte</button>
      </form>
    </main>
  );
}

export default Register;