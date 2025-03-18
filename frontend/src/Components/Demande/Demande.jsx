import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Demande.css";

const API_URL = "http://localhost:5207";
const userId = sessionStorage.getItem('userId');

const Demande = () => {
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
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
  }, []);

  const openCommentModal = async (demandeId) => {
    setSelectedDemande(demandeId);
    setShowModal(true);
    fetch(`http://localhost:5207/api/Commentaires/commentaires/${demandeId}`)
      .then((response) => response.json())
      .then((data) => setCommentaires(data))
      .catch(() => setCommentaires([]));
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    const commentaireData = {
      DemandeId: selectedDemande,
      UtilisateurId: 24, // Remplacez par l'ID réel de l'utilisateur connecté
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

  return (
    <div className="demande-grid">
      {demandes.map((demande) => (
        <div key={demande.id} className="demande-card">
          <Link to={`/demande/${demande.id}`} className="demande-link">
            <img src={demande.photoUrll[0]} alt={demande.titre} className="demande-image" />
            <h2 className="demande-title">{demande.titre}</h2>
            <p className="demande-description">{demande.description}</p>
            <p className="demande-location">{demande.ville}</p>
            <p className="demande-date">{new Date(demande.datePublication).toLocaleString()}</p>
          </Link>
          <div className="demande-actions">
            <button className="demande-like">Like</button>
            <button className="demande-comment" onClick={() => openCommentModal(demande.id)}>Comment</button>
          </div>
        </div>
      ))}

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