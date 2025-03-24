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
        // Corrige la transformation des URLs des images
        if (data.photoUrls) {
          data.photoUrls = data.photoUrls.map((url) =>
            url.startsWith("http") ? url : `${API_URL}${url}`
          );
        }
        setDemande(data);
      })
      .catch((error) => console.error("Error fetching demande details:", error));
  }, [id]);

  if (!demande) return <p>Loading...</p>;

  return (
    <div className="demande-details">
      <h1>{demande.titre}</h1>

      {/* Galerie d'images */}
      <div className="demande-images-gallery">
        {demande.photoUrls && demande.photoUrls.length > 0 ? (
          demande.photoUrls.map((photoUrl, index) => (
            <img
              key={index}
              src={photoUrl} // Plus besoin d'ajouter `API_URL`, il est déjà ajouté dans useEffect
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

      <p>{demande.description}</p>
      <p><strong>Ville:</strong> {demande.ville}</p>
      <p><strong>Date:</strong> {new Date(demande.datePublication).toLocaleString()}</p>
    </div>
  );
};

export default DemandeDetails;
