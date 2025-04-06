import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Demande.css";

const API_URL = "http://localhost:5207";

const Demande = () => {
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [userId, setUserId] = useState(null);

  // New demand form state
  const [newDemande, setNewDemande] = useState({
    Titre: "",
    Description: "",
    Ville: ""
  });
  const [demandePhotos, setDemandePhotos] = useState([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    console.log('Retrieved userId from sessionStorage:', storedUserId);
    setUserId(storedUserId ? parseInt(storedUserId, 10) : null);
    fetchDemandes();
  }, []);

  const fetchDemandes = () => {
    console.log('Current userId in fetchDemandes:', userId);
    fetch(`${API_URL}/api/Demandes/all-demande`)
      .then((response) => response.json())
      .then((data) => {
        const updatedData = data.map((demande) => ({
          ...demande,
          photoUrll: demande.photoUrll.map((url) =>
            url.startsWith("http") ? url : `${API_URL}${url}`
          ),
        }));
        setDemandes(updatedData);
      })
      .catch((error) => console.error("Error fetching demandes:", error));
  };

  const openCommentModal = async (demandeId) => {
    setSelectedDemande(demandeId);
    setShowModal(true);
    fetch(`${API_URL}/api/Commentaires/commentaires/${demandeId}`)
      .then((response) => response.json())
      .then((data) => setCommentaires(data))
      .catch(() => setCommentaires([]));
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    console.log('Using userId for comment:', userId);
    
    if (!userId) {
      console.error('No user ID available for comment submission');
      alert('Veuillez vous connecter pour commenter.');
      return;
    }
    
    const commentaireData = {
      DemandeId: selectedDemande,
      UtilisateurId: userId,
      Contenu: newComment,
    };
  
    try {
      const response = await fetch(`${API_URL}/api/Commentaires/ajouter-commentaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentaireData),
      });
      if (response.ok) {
        setNewComment("");
        openCommentModal(selectedDemande); // Recharger les commentaires
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDemande({
      ...newDemande,
      [name]: value
    });
    // Clear error message when user starts typing
    if (submitError) {
      setSubmitMessage("");
      setSubmitError(false);
      setDebugInfo(null);
    }
  };

  // Handle photo uploads
  const handlePhotoChange = (e) => {
    if (e.target.files) {
      setDemandePhotos(Array.from(e.target.files));
    }
  };

  // Submit new demand
  const handleSubmitDemande = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitMessage("");
    setSubmitError(false);
    setDebugInfo(null);
    
    console.log('user id =', userId);
    if (!userId) {
      setSubmitMessage("Veuillez vous connecter pour créer une demande");
      setSubmitError(true);
      setIsLoading(false);
      return;
    }
  
    if (!newDemande.Titre.trim() || !newDemande.Description.trim() || !newDemande.Ville.trim()) {
      setSubmitMessage("Tous les champs sont requis");
      setSubmitError(true);
      setIsLoading(false);
      return;
    }
  
    const formData = new FormData();
    formData.append("ClientId", userId.toString());  // Fixed: changed userIdNum to userId
    formData.append("Titre", newDemande.Titre.trim());
    formData.append("Description", newDemande.Description.trim());
    formData.append("Ville", newDemande.Ville.trim());
    
    if (demandePhotos.length > 0) {
      demandePhotos.forEach(photo => {
        formData.append("photos", photo);
      });
    }
  
    try {
      console.log("Submitting with userId:", userId);  // Fixed: changed userIdNum to userId
      
      const response = await fetch(`${API_URL}/api/Demandes/create`, {
        method: "POST",
        body: formData
      });
  
      const responseText = await response.text();
      let responseData;
      
      try {
        // Try to parse as JSON if possible
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // If it's not valid JSON, use the raw text
        responseData = { rawResponse: responseText };
      }
      
      // Log the full response for debugging
      console.log("Server response:", responseData);
      
      if (response.ok) {
        setSubmitMessage("Demande créée avec succès!");
        setNewDemande({ Titre: "", Description: "", Ville: "" });
        setDemandePhotos([]);
        fetchDemandes(); // Refresh the demand list
      } else {
        setSubmitMessage(`Erreur: ${responseData.message || "Échec de la création de la demande"}`);
        setSubmitError(true);
        setDebugInfo(responseData);
      }
    } catch (error) {
      console.error("Error creating demand:", error);
      setSubmitMessage("Une erreur est survenue lors de la création de la demande");
      setSubmitError(true);
      setDebugInfo({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="demande-container">
      
      <div className="demande-grid">
        
        {demandes.length > 0 ? (
          demandes.map((demande) => (
            <div key={demande.id} className="demande-card">
            <div className="demande-public-title">  <h4>Demande publique</h4> </div>  
              <Link to={`/demande/${demande.id}`} className="demande-link">
                <img 
                  src={demande.photoUrll && demande.photoUrll.length > 0 ? demande.photoUrll[0] : "/placeholder-image.jpg"} 
                  alt={demande.titre} 
                  className="demande-image" 
                  onError={(e) => {e.target.onerror = null; e.target.src = "/placeholder-image.jpg"}}
                />
                <h2 className="demande-title">{demande.titre}</h2>
                <p className="demande-description">
  {demande.description.length > 200
    ? demande.description.slice(0, 200) + '...'
    : demande.description}
</p>
                <p className="demande-location">{demande.ville}</p>
                <p className="demande-date">{new Date(demande.datePublication).toLocaleString()}</p>
              </Link>
              <div className="demande-actions">
                <button className="demande-like">Like</button>
                <button className="demande-comment" onClick={() => openCommentModal(demande.id)}>Comment</button>
              </div>
            </div>
          ))
        ) : (
          <p>Aucune demande disponible pour le moment.</p>
        )}
      </div>

      {/* New demand form */}
      <div className="demande-form-container">
        <h2>Demande public</h2>
        <form onSubmit={handleSubmitDemande} className="demande-form">
          <div className="form-group">
            <label htmlFor="titre">Titre:<span className="required">*</span></label>
            <input
              type="text"
              id="titre"
              name="Titre"
              value={newDemande.Titre}
              onChange={handleInputChange}
              required
              className={submitError && !newDemande.Titre.trim() ? "error-input" : ""}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description:<span className="required">*</span></label>
            <textarea
              id="description"
              name="Description"
              value={newDemande.Description}
              onChange={handleInputChange}
              required
              className={submitError && !newDemande.Description.trim() ? "error-input" : ""}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="ville">Ville:<span className="required">*</span></label>
            <input
              type="text"
              id="ville"
              name="Ville"
              value={newDemande.Ville}
              onChange={handleInputChange}
              required
              className={submitError && !newDemande.Ville.trim() ? "error-input" : ""}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="photos">Photos:</label>
            <input
              type="file"
              id="photos"
              name="photos"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
            />
            <small>Formats acceptés: JPG, JPEG, PNG, GIF</small>
          </div>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading}
          >
            {isLoading ? "Création en cours..." : "Poster ma demande"}
          </button>
          
          {submitMessage && (
            <p className={`submit-message ${submitError ? "error" : "success"}`}>
              {submitMessage}
            </p>
          )}
          
          {/* Debug information - for development only */}
          {debugInfo && (
            <div className="debug-info">
              <h4>Debug Information:</h4>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </form>
      </div>

      {showModal && (
        <div className="comment-modal">
          <div className="modal-content">
            <h2>Commentaires</h2>
            <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
            <div className="comment-list">
              {commentaires.length > 0 ? (
                commentaires.map((comment) => (
                  <div key={comment.id} className="comment">
                    <strong>{comment.utilisateurNom}:</strong>
                    <p>{comment.contenu}</p>
                    <span>{new Date(comment.dateCommentaire).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p>Aucun commentaire pour cette demande.</p>
              )}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajoutez un commentaire..."
            ></textarea>
            <button onClick={handleCommentSubmit}>Envoyer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demande;