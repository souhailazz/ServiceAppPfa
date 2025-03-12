import './Login.css';
import { useState } from 'react';

const Login = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasseHash: '',
    telephone: '',
    ville: '',
    role: 'client',
    metier: '',
    description: '',
    tarif: '',
    disponibilite: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5207/api/Utilisateurs/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        window.location.href = '/HomePage';
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Inscription</h2>
        
        <div className="form-group">
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" required />
        </div>

        <div className="form-group">
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" required />
        </div>

        <div className="form-group">
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        </div>

        <div className="form-group">
          <input type="password" name="motDePasseHash" value={formData.motDePasseHash} onChange={handleChange} placeholder="Mot de passe" required />
        </div>

        <div className="form-group">
          <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" />
        </div>

        <div className="form-group">
          <input type="text" name="ville" value={formData.ville} onChange={handleChange} placeholder="Ville" />
        </div>

        <div className="form-group">
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="client">Client</option>
            <option value="professionnel">Professionnel</option>
          </select>
        </div>

        {formData.role === 'professionnel' && (
          <div className="professional-fields">
            <div className="form-group">
              <input type="text" name="metier" value={formData.metier} onChange={handleChange} placeholder="Métier" required />
            </div>

            <div className="form-group">
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description de vos services" required />
            </div>

            <div className="form-group">
              <input type="number" name="tarif" value={formData.tarif} onChange={handleChange} placeholder="Tarif horaire" required />
            </div>

            <div className="form-group">
              <input type="text" name="disponibilite" value={formData.disponibilite} onChange={handleChange} placeholder="Disponibilité" required />
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn">S'inscrire</button>
      </form>
    </div>
  );
};

export default Login;