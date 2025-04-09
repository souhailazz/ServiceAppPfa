import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DemandeDetails.css";

const API_URL = "http://localhost:5207";

const DemandeDetails = () => {
  const { id } = useParams();
  const [demande, setDemande] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch demande details
    fetch(`${API_URL}/api/Demandes/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.photoUrls) {
          data.photoUrls = data.photoUrls.map((url) =>
            url.startsWith("http") ? url : `${API_URL}${url}`
          );
        }
        setDemande(data);
      })
      .catch((error) =>
        console.error("Error fetching demande details:", error)
      );

    // Fetch comments
    fetch(`${API_URL}/api/Commentaires/commentaires/${id}`)
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("Error fetching comments:", error));

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      const response = await fetch(`${API_URL}/api/Commentaires/ajouter-commentaire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          DemandeId: parseInt(id),
          UtilisateurId: currentUser.id,
          Contenu: newComment,
        }),
      });

      if (response.ok) {
        const updatedComments = await fetch(`${API_URL}/api/Commentaires/commentaires/${id}`)
          .then((res) => res.json());
        setComments(updatedComments);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        `${API_URL}/api/Commentaires/supprimer-commentaire/${commentId}/${currentUser.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedComments = await fetch(`${API_URL}/api/Commentaires/commentaires/${id}`)
          .then((res) => res.json());
        setComments(updatedComments);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (!demande) return <p>Loading...</p>;

  return (
    <div className="demande-details">
      {/* Infos Utilisateur en premier */}
      <div className="demande-utilisateur">
        <h2>Informations du demandeur</h2>
        <p>
          <strong>Nom:</strong> {demande.utilisateur.nom}
        </p>
        <p>
          <strong>Prénom:</strong> {demande.utilisateur.prenom}
        </p>
        <p>
          <strong>Téléphone:</strong> {demande.utilisateur.telephone}
        </p>
        <p>
          <strong>Ville:</strong> {demande.utilisateur.ville}
        </p>
      </div>

      {/* Titre de la demande */}
      <h1>{demande.titre}</h1>

      {/* Date et Ville de la demande */}
      <p>
        <strong>Ville:</strong> {demande.ville}
      </p>
      <p>
        <strong>Date:</strong>{" "}
        {new Date(demande.datePublication).toLocaleString()}
      </p>

      {/* Galerie d'images */}
      <div className="demande-images-gallery">
        {demande.photoUrls && demande.photoUrls.length > 0 ? (
          demande.photoUrls.map((photoUrl, index) => (
            <img
              key={index}
              src={photoUrl}
              alt={`${demande.titre} - image ${index + 1}`}
              className="demande-detail-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
              }}
            />
          ))
        ) : (
          <img
            src="/placeholder-image.jpg"
            alt="Pas d'image disponible"
            className="demande-detail-image"
          />
        )}
      </div>

      {/* Description */}
      <p>{demande.description}</p>

      {/* Comments Section */}
      <div className="comments-section">
        <h2>Commentaires ({comments.length})</h2>
        
        {/* Add Comment Form */}
        {currentUser && (
          <form onSubmit={handleAddComment} className="add-comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              required
            />
            <button type="submit">Publier</button>
          </form>
        )}

        {/* Comments List */}
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.utilisateurNom}</span>
                <span className="comment-date">
                  {new Date(comment.dateCommentaire).toLocaleString()}
                </span>
                {currentUser && currentUser.id === comment.utilisateurId && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="delete-comment-btn"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              <p className="comment-content">{comment.contenu}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemandeDetails;
