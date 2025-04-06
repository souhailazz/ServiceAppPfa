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

const ProfessionnelDetails = () => {
  const { id } = useParams();
  const [professionnel, setProfessionnel] = useState(null);
  const [selectedTab, setSelectedTab] = useState("accueil");

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
