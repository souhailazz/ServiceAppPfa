import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DemandeDetails.css";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaComment,
  FaTrashAlt,
  FaPaperPlane,
} from "react-icons/fa";
import { BsImages } from "react-icons/bs";

const API_URL = "http://localhost:5207";

const DemandeDetails = () => {
  const { id } = useParams();
  const [demande, setDemande] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/Demandes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.photoUrls) {
          data.photoUrls = data.photoUrls.map((url) =>
            url.startsWith("http") ? url : `${API_URL}${url}`
          );
        }
        setDemande(data);
      })
      .catch((err) => console.error("Erreur récupération demande :", err));

    fetch(`${API_URL}/api/Commentaires/commentaires/${id}`)
      .then((res) => res.json())
      .then(setComments)
      .catch((err) => console.error("Erreur récupération commentaires :", err));

    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      const response = await fetch(`${API_URL}/api/Commentaires/ajouter-commentaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DemandeId: parseInt(id),
          UtilisateurId: currentUser.id,
          Contenu: newComment,
        }),
      });

      if (response.ok) {
        const updatedComments = await fetch(`${API_URL}/api/Commentaires/commentaires/${id}`).then((r) => r.json());
        setComments(updatedComments);
        setNewComment("");
      }
    } catch (err) {
      console.error("Erreur ajout commentaire :", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;
    try {
      const response = await fetch(
        `${API_URL}/api/Commentaires/supprimer-commentaire/${commentId}/${currentUser.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        const updated = await fetch(`${API_URL}/api/Commentaires/commentaires/${id}`).then((r) => r.json());
        setComments(updated);
      }
    } catch (err) {
      console.error("Erreur suppression commentaire :", err);
    }
  };

  if (!demande) return <p>Chargement...</p>;

  return (
<div className="demande-page">
  <div className="grid-layout">
    {/* Colonne gauche */}
    <div className="main-content">
      <div className="card demande-info">
        <h1 className="title">{demande.titre}</h1>
        <div className="sub-info">
          <span><FaMapMarkerAlt className="icon" /> {demande.ville}</span>
          <span><FaCalendarAlt className="icon" /> {new Date(demande.datePublication).toLocaleString()}</span>
        </div>
        <h3 className="section-title">Description</h3>
        <p className="description-text">{demande.description}</p>
      </div>

      <div className="card image-section">
        <h3 className="section-title"><BsImages className="icon" /> Images</h3>
        {demande.photoUrls?.length > 0 ? (
          <div className="image-grid">
            {demande.photoUrls.map((url, i) => (
              <img key={i} src={url} alt={`photo-${i}`} className="image-item" />
            ))}
          </div>
        ) : (
          <img src="/placeholder-image.jpg" alt="placeholder" className="image-item" />
        )}
      </div>

      <div className="card comment-section">
        <h3 className="section-title"><FaComment className="icon" /> Commentaires ({comments.length})</h3>
        
        {currentUser && (
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrire un commentaire..."
              required
            />
            <button type="submit" className="btn-comment"><FaPaperPlane /> Publier</button>
          </form>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="comment-box">
            <div className="comment-meta">
              <strong><FaUser /> {comment.utilisateurNom}</strong>
              <span><FaCalendarAlt /> {new Date(comment.dateCommentaire).toLocaleString()}</span>
              {currentUser?.id === comment.utilisateurId && (
                <button onClick={() => handleDeleteComment(comment.id)} className="delete-btn">
                  <FaTrashAlt />
                </button>
              )}
            </div>
            <p>{comment.contenu}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Colonne droite */}
    <div className="sidebar">
  <div className="card user-card">
    <h3><FaUser className="icon" /> Demandeur</h3>
    
    <div className="user-profile">
      <div className="user-avatar">
        {demande.utilisateur.photoUrl ? (
          <img src={demande.utilisateur.photoUrl} alt="Photo profil" />
        ) : (
          <FaUser className="fallback-icon" />
        )}
      </div>
      <div className="user-name">
        <h4>{demande.utilisateur.prenom} {demande.utilisateur.nom}</h4>
        <p>Membre actif</p>
      </div>
    </div>
    
    <div className="user-info-list">
      <div className="user-info-item">
        <FaPhone className="icon" />
        <p><span className="user-info-label">Téléphone:</span> {demande.utilisateur.telephone}</p>
      </div>
      
      <div className="user-info-item">
        <FaMapMarkerAlt className="icon" />
        <p><span className="user-info-label">Localisation:</span> {demande.utilisateur.ville}</p>
      </div>
      
      {demande.utilisateur.email && (
        <div className="user-info-item">
          <FaPaperPlane className="icon" />
          <p><span className="user-info-label">Email:</span> {demande.utilisateur.email}</p>
        </div>
      )}
    </div>
    
    <button className="user-contact-btn">
      <FaComment className="icon" /> Contacter
    </button>
    
    <div className="user-joined">
      <FaCalendarAlt className="icon" /> Membre depuis {new Date(demande.utilisateur.dateInscription || Date.now()).toLocaleDateString()}
    </div>
  </div>
</div>
  </div>
</div>
  );
};

export default DemandeDetails;
