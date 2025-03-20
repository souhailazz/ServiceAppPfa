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
        // Apply the same URL transformation as in Demande.jsx
        if (data.photoUrll) {
          data.photoUrll = data.photoUrll.map((url) =>
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
      
      {/* Image gallery */}
      <div className="demande-images-gallery">
        {demande.photoUrll && demande.photoUrll.length > 0 ? (
          demande.photoUrll.map((photoUrl, index) => (
            <img 
              key={index}
              src={photoUrl}
              alt={`${demande.titre} - image ${index + 1}`}
              className="demande-detail-image"
              onError={(e) => {e.target.onerror = null; e.target.src = "/placeholder-image.jpg"}}
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