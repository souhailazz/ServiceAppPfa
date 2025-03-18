import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

const API_URL = "http://localhost:5207";

const Profile = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDemande, setEditingDemande] = useState(null);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    ville: ""
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Replace with actual user ID from your authentication system
  const loggedInUserId = 24; // This should come from your auth context/state

  useEffect(() => {
    fetchUserDemandes();
  }, []);

  const fetchUserDemandes = () => {
    setLoading(true);
    fetch(`${API_URL}/api/Demandes/client/${loggedInUserId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Aucune demande trouvée");
        }
        return response.json();
      })
      .then((data) => {
        const updatedData = data.map((demande) => ({
          ...demande,
          photoUrll: demande.photoUrll.map((url) =>
            url.startsWith("http") ? url : `${API_URL}${url}`
          ),
        }));
        setDemandes(updatedData);
      })
      .catch((error) => {
        console.error("Error fetching user demandes:", error);
        setDemandes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEditClick = (demande) => {
    setEditingDemande(demande);
    setFormData({
      titre: demande.titre,
      description: demande.description,
      ville: demande.ville
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/api/Demandes/${editingDemande.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          clientId: loggedInUserId
        })
      });

      if (response.ok) {
        // Update local state
        setDemandes(prev => 
          prev.map(dem => 
            dem.id === editingDemande.id 
              ? { ...dem, titre: formData.titre, description: formData.description, ville: formData.ville } 
              : dem
          )
        );
        setShowEditModal(false);
      } else {
        console.error("Failed to update demande:", await response.text());
      }
    } catch (error) {
      console.error("Error updating demande:", error);
    }
  };

  const handleDeleteClick = (demandeId) => {
    setConfirmDelete(demandeId);
  };

  const confirmDeleteDemande = async () => {
    try {
      const response = await fetch(`${API_URL}/api/Demandes/${confirmDelete}`, {
        method: "DELETE"
      });

      if (response.ok) {
        // Remove from local state
        setDemandes(prev => prev.filter(dem => dem.id !== confirmDelete));
        setConfirmDelete(null);
      } else {
        console.error("Failed to delete demande:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting demande:", error);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingDemande(null);
  };

  return (
    <div className="profile-container">
      <h1>Mes demandes</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : demandes.length === 0 ? (
        <div className="no-demands">
          <p>Vous n'avez pas encore créé de demandes.</p>
          <Link to="/create-demande" className="create-btn">Créer une demande</Link>
        </div>
      ) : (
        <div className="demande-grid">
          {demandes.map((demande) => (
            <div key={demande.id} className="demande-card">
              <Link to={`/demande/${demande.id}`} className="demande-link">
                {demande.photoUrll && demande.photoUrll.length > 0 && (
                  <img src={demande.photoUrll[0]} alt={demande.titre} className="demande-image" />
                )}
                <h2 className="demande-title">{demande.titre}</h2>
                <p className="demande-description">{demande.description}</p>
                <p className="demande-location">{demande.ville}</p>
                <p className="demande-date">{new Date(demande.datePublication).toLocaleString()}</p>
              </Link>
              <div className="demande-actions">
                <button className="edit-btn" onClick={() => handleEditClick(demande)}>Modifier</button>
                <button className="delete-btn" onClick={() => handleDeleteClick(demande.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Modifier la demande</h2>
            <button className="close-btn" onClick={closeEditModal}>X</button>
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label htmlFor="titre">Titre:</label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ville">Ville:</label>
                <input
                  type="text"
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="button" onClick={closeEditModal}>Annuler</button>
                <button type="submit">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer cette demande ?</p>
            <div className="form-buttons">
              <button onClick={cancelDelete}>Annuler</button>
              <button className="delete-btn" onClick={confirmDeleteDemande}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;