import React from "react";
import "./ProCard.css";

function renderStars(note) {
  const stars = [];
  const full = Math.floor(note);
  const half = note - full >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<span key={i} style={{color:'#ffc107'}}>★</span>);
    else if (i === full && half) stars.push(<span key={i} style={{color:'#ffc107'}}>☆</span>);
    else stars.push(<span key={i} style={{color:'#e4e5e9'}}>★</span>);
  }
  return stars;
}

export default function ProCard({ id, photo, nom, prenom, metier, ville, telephone, note, disponibilite, tarif }) {
  // Corriger l'URL de la photo si besoin
  let photoUrl = photo;
  if (photo && photo.startsWith("/uploads")) {
    photoUrl = `http://localhost:5207${photo}`;
  }

  const handleClick = () => {
    if (id) {
      window.location.href = `/professionnel/${id}`;
    }
  };

  const handleCall = (e) => {
    e.stopPropagation();
    window.open(`tel:${telephone}`);
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    window.open(`https://wa.me/${telephone.replace(/\D/g,"")}`);
  };

  return (
    <div className="procard-container procard-rich" style={{cursor: id ? 'pointer' : 'default'}} onClick={handleClick}>
      <div className="procard-photo">
        <img src={photoUrl || "/placeholder-image.jpg"} alt="profil" />
      </div>
      <div className="procard-infos">
        <div className="procard-header">
          <span className="procard-nom">{prenom} {nom}</span>
          {disponibilite && <span className={`procard-badge ${disponibilite.toLowerCase().includes('dispo') ? 'dispo' : 'indispo'}`}>{disponibilite}</span>}
        </div>
        <div className="procard-row">
          <span className="procard-icn">{metier && metier.toLowerCase().includes('plombier') ? '🔧' : metier && metier.toLowerCase().includes('électricien') ? '💡' : '👷'}</span>
          <span className="procard-metier">{metier}</span>
          <span className="procard-icn" style={{marginLeft:8}}>📍</span>
          <span className="procard-ville">{ville}</span>
        </div>
        <div className="procard-row">
          <span className="procard-stars">{renderStars(note)}</span>
          <span className="procard-note">{note ? note.toFixed(1) : 'N/A'}</span>
          {tarif > 0 && <span className="procard-tarif">| {tarif} DH</span>}
        </div>
        <div className="procard-row">
          <span className="procard-icn">📞</span>
          <a href={`tel:${telephone}`} className="procard-tel" onClick={handleCall}>{telephone}</a>
          <button className="procard-wa" title="WhatsApp" onClick={handleWhatsApp}>
            <svg width="18" height="18" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#25D366"/><path d="M23.5 19.6c-.3-.2-1.7-.8-2-1s-.5-.2-.7.1c-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.3-.9-.8-1.5-1.7-1.7-2-.2-.3 0-.4.1-.6.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3.1-.1.1-.2.2-.3.1-.2.1-.3 0-.5-.1-.2-.7-1.7-1-2.3-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4 0-.6.2-.2.2-.8.8-.8 2 0 1.2.8 2.4 1 2.7.2.3 1.6 2.5 3.8 3.4 2.2.9 2.2.6 2.6.6.4 0 1.3-.5 1.5-1 .2-.5.2-.9.1-1.1z" fill="#fff"/></svg>
          </button>
          <button className="procard-btn" onClick={e => {e.stopPropagation(); handleClick();}}>Voir le profil</button>
        </div>
      </div>
    </div>
  );
} 