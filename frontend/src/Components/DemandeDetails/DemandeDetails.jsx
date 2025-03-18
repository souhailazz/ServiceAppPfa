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
      .then((data) => setDemande(data))
      .catch((error) => console.error("Error fetching demande details:", error));
  }, [id]);

  if (!demande) return <p>Loading...</p>;

  return (
    <div className="demande-details">
      <img 
        src={demande.photoUrll?.[0] || "https://via.placeholder.com/150"}  
        alt={demande.titre} 
        className="demande-detail-image" 
      />
      <h1>{demande.titre}</h1>
      <p>{demande.description}</p>
      <p><strong>Ville:</strong> {demande.ville}</p>
      <p><strong>Date:</strong> {new Date(demande.datePublication).toLocaleString()}</p>
    </div>
  );
};

export default DemandeDetails;
