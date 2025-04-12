import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProfessionnelDetails.css";

const API_URL = "http://localhost:5207";

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <span key={i} className="star full">
          ★
        </span>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="star half">
          ★
        </span>
      );
    } else {
      stars.push(
        <span key={i} className="star empty">
          ☆
        </span>
      );
    }
  }

  return stars;
};

// Interactive rating component for user input
const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={`star-selectable ${starValue <= (hover || rating) ? "full" : "empty"}`}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            {starValue <= (hover || rating) ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
};

const ProfessionnelDetails = () => {
  const { id } = useParams();
  const [userId, setUserId] = useState(null);

  const [professionnel, setProfessionnel] = useState(null);
  const [selectedTab, setSelectedTab] = useState("accueil");
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Get user ID from your authentication system
  const getUserId = () => {
    const storedUserId = sessionStorage.getItem('userId');
    console.log('Retrieved userId from sessionStorage:', storedUserId);
    setUserId(storedUserId ? parseInt(storedUserId, 10) : null);
    return storedUserId; // Replace with actual authenticated user ID
  };

  useEffect(() => {
    fetch(`${API_URL}/api/Professionnel/professionnel/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.photos) {
          data.photos = data.photos.map((url) =>
            url.startsWith("http") ? url : `${API_URL}${url}`
          );
        }
        setProfessionnel(data);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement du professionnel:", error);
      });
  }, [id]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    
    const userId = getUserId();
    
    if (userRating === 0) {
      setSubmitError("Veuillez sélectionner une note.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const response = await fetch(`${API_URL}/api/Evaluation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          professionnelId: parseInt(id),
          clientId: userId,
          note: userRating,
          commentaire: userComment
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitMessage(data.message || "Merci pour votre évaluation !");
        setUserRating(0);
        setUserComment("");
        
        // Refresh professional data to show the new evaluation
        fetch(`${API_URL}/api/Professionnel/professionnel/${id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.photos) {
              data.photos = data.photos.map((url) =>
                url.startsWith("http") ? url : `${API_URL}${url}`
              );
            }
            setProfessionnel(data);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
              setSubmitMessage("");
            }, 3000);
          });
      } else {
        const error = await response.json();
        setSubmitError(error.message || "Une erreur est survenue lors de l'envoi de votre évaluation.");
      }
    } catch (error) {
      setSubmitError("Une erreur est survenue. Veuillez réessayer plus tard.");
      console.error("Erreur lors de l'envoi de l'évaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!professionnel) return <p>Chargement du profil...</p>;

  const renderContent = () => {
    switch (selectedTab) {
      case "accueil":
        return (
          <div className="main-section">
            <div className="card">
              <h2>Présentation</h2>
              <p>{professionnel.description || "Non renseignée"}</p>
            </div>

            <div className="card">
              <h2>Photos de réalisations</h2>
              <div className="photo-gallery">
                {professionnel.photos.length > 1 ? (
                  professionnel.photos.slice(1, 4).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Réalisation ${i + 2}`}
                      className="realisation-photo"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  ))
                ) : (
                  <p>Aucune autre photo disponible.</p>
                )}
              </div>
            </div>

            <div className="card">
              <h2>Évaluations</h2>
              <div className="evaluations-list">
                {professionnel.evaluations.length > 0 ? (
                  professionnel.evaluations.map((evalItem, i) => (
                    <div className="evaluation" key={i}>
                      <p>
                        <strong>
                          {evalItem.clientPrenom} {evalItem.clientNom}
                        </strong>
                      </p>
                      <p className="eval-note">
                        Note : {evalItem.note}/5 {renderStars(evalItem.note)}
                      </p>
                      <p>{evalItem.commentaire}</p>
                      <p className="eval-date">
                        {new Date(evalItem.dateEvaluation).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>Aucune évaluation.</p>
                )}
              </div>
            </div>
          </div>
        );
      case "photos":
        return (
          <div className="photo-gallery">
            {professionnel.photos.length > 0 ? (
              professionnel.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Réalisation ${i + 1}`}
                  className="realisation-photo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              ))
            ) : (
              <p>Aucune photo disponible.</p>
            )}
          </div>
        );
      case "avis":
        return (
          <div>
            <div className="rating-form-container">
              <h3>Donnez votre avis</h3>
              <form onSubmit={handleSubmitRating} className="rating-form">
                <div className="rating-section">
                  <label>Votre note:</label>
                  <StarRating rating={userRating} setRating={setUserRating} />
                </div>
                
                <div className="comment-section">
                  <label htmlFor="comment">Votre commentaire:</label>
                  <textarea
                    id="comment"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Partagez votre expérience avec ce professionnel..."
                    rows={4}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="submit-rating-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Soumettre votre évaluation"}
                </button>
                
                {submitMessage && <div className="success-message">{submitMessage}</div>}
                {submitError && <div className="error-message">{submitError}</div>}
              </form>
            </div>
            
            <div className="evaluations-list">
              <h3>Avis des clients ({professionnel.evaluations.length})</h3>
              {professionnel.evaluations.length > 0 ? (
                professionnel.evaluations.map((evalItem, i) => (
                  <div className="evaluation" key={i}>
                    <p>
                      <strong>
                        {evalItem.clientPrenom} {evalItem.clientNom}
                      </strong>
                    </p>
                    <p className="eval-note">
                      Note : {evalItem.note}/5 {renderStars(evalItem.note)}
                    </p>
                    <p>{evalItem.commentaire}</p>
                    <p className="eval-date">
                      {new Date(evalItem.dateEvaluation).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p>Aucune évaluation pour le moment. Soyez le premier à donner votre avis !</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="professionnel-details">
      <div className="header">
        <div className="header-top">
          <div className="photo-profil">
            {professionnel.photos.length > 0 ? (
              <img
                src={professionnel.photos[0]}
                alt="Photo de profil"
                className="realisation-photo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            ) : (
              <p>Aucune photo disponible.</p>
            )}
          </div>
          <div>
            <div className="nom-prenom">
              {professionnel.prenom} {professionnel.nom}
            </div>
            <div className="metier">{professionnel.metier}</div>
          </div>
          <div className="dispo-badge">{professionnel.disponibilite}</div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={selectedTab === "accueil" ? "active" : ""}
          onClick={() => setSelectedTab("accueil")}
        >
          Accueil
        </button>
        <button
          className={selectedTab === "photos" ? "active" : ""}
          onClick={() => setSelectedTab("photos")}
        >
          Photos
        </button>
        <button
          className={selectedTab === "avis" ? "active" : ""}
          onClick={() => setSelectedTab("avis")}
        >
          Avis
        </button>
      </div>

      <div className="sections">{renderContent()}</div>

      <div className="side-section">
        <p>
          <strong>Ville :</strong> {professionnel.ville}
        </p>
        <p>
          <strong>Tarif :</strong> {professionnel.tarif} €
        </p>
        <p>
          <strong>Note moyenne :</strong>{" "}
          {professionnel.moyenneNote?.toFixed(1) || "N/A"}
        </p>
        <p>
          <strong>Disponibilité :</strong> {professionnel.disponibilite}
        </p>
      </div>
    </div>
  );
};

export default ProfessionnelDetails;