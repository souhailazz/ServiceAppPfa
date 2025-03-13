import { useEffect, useState } from "react";
import "./Demande.css";

const API_URL = "http://localhost:5207"; // Define API base URL

const Demande = () => {
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/Demandes/all-demande`)
      .then((response) => response.json())
      .then((data) => {
        // Ensure each demande's image URLs are properly formatted
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

  return (
    <div className="demande-grid">
      {demandes.map((demande) => (
        <div key={demande.id} className="demande-card">
          <img
            src={demande.photoUrll[0]} // Now it ensures a full URL
            alt={demande.titre}
            className="demande-image"
          />
          <h2 className="demande-title">{demande.titre}</h2>
          <p className="demande-description">{demande.description}</p>
          <p className="demande-location">{demande.ville}</p>
          <p className="demande-date">
            {new Date(demande.datePublication).toLocaleString()}
          </p>
          <div className="demande-actions">
            <button className="demande-like">Like</button>
            <button className="demande-comment">Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Demande;
