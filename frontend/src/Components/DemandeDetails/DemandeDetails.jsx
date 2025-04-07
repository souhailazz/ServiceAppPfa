import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DemandeDetails.css";

const API_URL = "http://localhost:5207";

const DemandeDetails = () => {
  const { id } = useParams();
  const [demande, setDemande] = useState(null);

  useEffect(() => {
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
  }, [id]);

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
    </div>
  );
};

export default DemandeDetails;
