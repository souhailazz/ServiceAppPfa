import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
 import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);
    
    try {
        const response = await axios.post('http://localhost:5207/api/Utilisateurs/login', {
            Email: email,
            MotDePasse: password
        });
        
        if (response.status === 200) {
          sessionStorage.setItem('userId', response.data.utilisateurId);
          sessionStorage.setItem('userRole', response.data.role);
          console.log('User ID from login:', response.data.utilisateurId);
          
          // Trigger storage event to update navigation
          window.dispatchEvent(new Event('storage'));
          
          navigate('/HomePage');
        }
    } catch (err) {
        // Handle errors
        if (err.response) {
            // Server responded with an error status
            setError(err.response.data || 'Email ou mot de passe incorrect.');
        } else if (err.request) {
            // Request was made but no response received
            setError('Problème de connexion au serveur. Veuillez réessayer plus tard.');
        } else {
            // Something else happened
            setError('Une erreur s\'est produite. Veuillez réessayer.');
        }
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen">
      <div className="login-container">
        <h2 className="login-title">Connexion</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="signup-text">
          <p>
            Vous n'avez pas de compte ?{' '}
            <a href="/Signup" className="signup-link">
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;