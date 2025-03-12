import './SignUp.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Make sure this import is correct
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaUserTie } from 'react-icons/fa';
import { MdWork, MdDescription, MdEuro, MdAccessTime } from 'react-icons/md';

const SignUp = () => {
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        motDePasseHash: '',
        telephone: '',
        ville: '',
        role: 'Client',  // Change to uppercase 'C'
        metier: '',
        description: '',
        tarif: 0,  // Make sure this is a number, not a string
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
    console.log('Form submitted'); 
    console.log('Form data:', formData); 
    
    try {
      console.log('Sending request to API...');
      const response = await fetch('http://localhost:5207/api/Utilisateurs/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
  
      console.log('Response received:', response);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Registration successful:', result);
        navigate('/HomePage');
      } else {
        const errorText = await response.text();
        console.error('Response not OK:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.Message || 'Échec de l\'inscription');
        } catch (e) {
          alert(`Échec de l'inscription: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Erreur de connexion au serveur: ' + error.message);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Inscription</h2>
        
        <div className="form-group">
                    <div className="input-with-icon">
                        <FaUser className="input-icon" />
                        <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" required />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                        <FaUser className="input-icon" />
                        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" required />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                        <FaEnvelope className="input-icon" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                        <FaLock className="input-icon" />
                        <input type="password" name="motDePasseHash" value={formData.motDePasseHash} onChange={handleChange} placeholder="Mot de passe" required />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                        <FaPhone className="input-icon" />
                        <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                        <FaMapMarkerAlt className="input-icon" />
                        <input type="text" name="ville" value={formData.ville} onChange={handleChange} placeholder="Ville" />
                    </div>
                </div>

                <div className="form-group">
                    <div className="input-with-icon">
                        <FaUserTie className="input-icon" />
                        <select name="role" value={formData.role} onChange={handleChange} required>
                            <option value="client">Client</option>
                            <option value="professionnel">Professionnel</option>
                        </select>
                    </div>
                </div>

                {formData.role === 'professionnel' && (
                    <div className="professional-fields">
                        <div className="form-group">
                        <div className="form-group">
    <div className="input-with-icon">
        <MdWork className="input-icon" />
        <select 
            name="metier" 
            value={formData.metier} 
            onChange={handleChange} 
            required
            className="profession-select"
        >
            <option value="">Sélectionnez votre métier</option>
            <option value="Plombier">Plombier</option>
            <option value="Électricien">Électricien</option>
            <option value="Mécanicien">Mécanicien</option>
            <option value="Jardinier">Jardinier</option>
            <option value="Menuisier">Menuisier</option>
            <option value="Peintre">Peintre</option>
            <option value="Peintre">Menuisier</option>
            <option value="Menuisier">Menuisier</option>
            <option value="Tolier">Tolier</option>



        </select>
    </div>
</div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <MdDescription className="input-icon" />
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description de vos services" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <MdEuro className="input-icon" />
                                <input type="number" name="tarif" value={formData.tarif} onChange={handleChange} placeholder="Tarif horaire" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-with-icon">
                                <MdAccessTime className="input-icon" />
                                <input type="text" name="disponibilite" value={formData.disponibilite} onChange={handleChange} placeholder="Disponibilité" required />
                            </div>
                        </div>
                    </div>
                )}

                <button type="submit" className="submit-btn">S'inscrire</button>
            </form>
        </div>
    );
};

export default SignUp;