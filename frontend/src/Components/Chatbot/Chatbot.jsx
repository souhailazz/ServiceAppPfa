import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import ProCard from "./ProCard";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    ville: '',
    metier: '',
    photo: null,
    photoPreview: null
  });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Message d'accueil qui s'affiche à l'ouverture du chatbot
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { 
          text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?", 
          fromUser: false 
        }
      ]);
    }
  }, [open, messages.length]);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { text: input, fromUser: true };
    setMessages(prev => [...prev, newMessage]);

    // Vérifier si l'utilisateur veut créer une demande directement depuis le message
    if (input.toLowerCase().includes('créer une demande') || 
        input.toLowerCase().includes('creer une demande') || 
        input.toLowerCase().includes('nouvelle demande')) {
      setMessages(prev => [...prev, { 
        text: "Je vais vous aider à créer une demande. Veuillez remplir le formulaire suivant :", 
        fromUser: false 
      }]);
      setShowForm(true);
      setInput('');
      return;
    }

    try {
      const response = await fetch('http://localhost:5207/api/Chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, utilisateurId: 8 }),
      });

      const data = await response.json();
      // Détection de l'intention 'creer_demande' depuis l'API
      if (data.intent === "creer_demande") {
        setMessages(prev => [...prev, { 
          text: "Je vais vous aider à créer une demande. Veuillez remplir le formulaire suivant :", 
          fromUser: false 
        }]);
        setShowForm(true);
      } 
      // Si la réponse contient une liste de professionnels
      else if (data.professionnels) {
        setMessages(prev => [...prev, { ...data, fromUser: false, isProList: true }]);
      } else {
        setMessages(prev => [...prev, { text: data.reponse, fromUser: false }]);
      }
    } catch (error) {
      console.error('Erreur en envoyant le message :', error);
      // Message d'erreur en cas de problème avec l'API
      setMessages(prev => [...prev, { 
        text: "Désolé, j'ai rencontré un problème de connexion. Veuillez réessayer plus tard.", 
        fromUser: false 
      }]);
    }

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ 
          ...prev, 
          photo: file,
          photoPreview: event.target.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Créer un FormData pour envoyer le fichier
      const formDataToSend = new FormData();
      formDataToSend.append("UtilisateurId", 8);
      formDataToSend.append("Titre", formData.titre);
      formDataToSend.append("Description", formData.description);
      formDataToSend.append("Ville", formData.ville);
      formDataToSend.append("Metier", formData.metier);
      
      // Ajouter la photo si elle existe
      if (formData.photo) {
        formDataToSend.append("Photo", formData.photo);
      }
      
      const res = await fetch("http://localhost:5207/api/Demandes", {
        method: "POST",
        body: formDataToSend,
      });
      
      if (res.ok) {
        setMessages(prev => [...prev, { 
          text: `Votre demande "${formData.titre}" a bien été créée ! Un professionnel vous contactera bientôt.`, 
          fromUser: false 
        }]);
        // Reset du formulaire
        setFormData({
          titre: '',
          description: '',
          ville: '',
          metier: '',
          photo: null,
          photoPreview: null
        });
        setShowForm(false);
      } else {
        setMessages(prev => [...prev, { 
          text: "Erreur lors de la création de la demande. Veuillez vérifier les informations saisies.", 
          fromUser: false 
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { 
        text: "Erreur réseau lors de la création de la demande. Veuillez réessayer plus tard.", 
        fromUser: false 
      }]);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setMessages(prev => [...prev, { 
      text: "Création de demande annulée. Comment puis-je vous aider autrement ?", 
      fromUser: false 
    }]);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // SVG de robot pour le bouton
  const RobotIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <rect x="9" y="7" width="6" height="4" />
      <line x1="10" y1="21" x2="10" y2="24" />
      <line x1="14" y1="21" x2="14" y2="24" />
      <circle cx="8" cy="15" r="1" />
      <circle cx="16" cy="15" r="1" />
    </svg>
  );

  return (
    <div className="chatbot-container">
      <button 
        className="chatbot-button" 
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fermer le chatbot" : "Ouvrir le chatbot"}
      >
        {open ? "×" : <RobotIcon />}
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span className="chatbot-title">Assistant virtuel</span>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => {
              // Si c'est une réponse enrichie avec des professionnels
              if (msg.isProList && msg.professionnels) {
                return (
                  <div key={index} className="bot-message">
                    <div style={{marginBottom: 6}}>{msg.reponse}</div>
                    <div className="pro-cards-container">
                      {msg.professionnels.map((pro, idx) => (
                        <ProCard
                          key={idx}
                          id={pro.id}
                          prenom={pro.prenom}
                          nom={pro.nom}
                          metier={pro.metier}
                          ville={pro.ville}
                          telephone={pro.telephone}
                          photo={pro.photo}
                        />
                      ))}
                    </div>
                  </div>
                );
              }
              // Ancien format texte (fallback)
              if (!msg.fromUser && msg.text && msg.text.startsWith("Voici des ")) {
                const lines = msg.text.split("\n").filter(l => l.trim().startsWith("- "));
                if (lines.length > 0) {
                  return (
                    <div key={index} className="bot-message">
                      <div style={{marginBottom: 6}}>{msg.text.split("\n")[0]}</div>
                      <div className="pro-cards-container">
                        {lines.map((line, idx) => {
                          const parts = line.replace("- ", "").split("|");
                          const nomPrenom = parts[0]?.trim().split(" ");
                          const prenom = nomPrenom?.[0] || "";
                          const nom = nomPrenom?.slice(1).join(" ") || "";
                          const telephone = parts[1]?.trim() || "Non renseigné";
                          return (
                            <ProCard
                              key={idx}
                              prenom={prenom}
                              nom={nom}
                              metier={""}
                              ville={""}
                              telephone={telephone}
                              photo={""}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              }
              // Sinon, affichage classique
              return (
                <div 
                  key={index} 
                  className={msg.fromUser ? 'user-message' : 'bot-message'}
                >
                  {msg.text}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Formulaire de demande */}
          {showForm ? (
            <div className="chatbot-form">
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleFormChange}
                    placeholder="Titre de la demande *"
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Description de votre besoin *"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleFormChange}
                      placeholder="Ville *"
                      required
                    />
                  </div>
                  <div className="form-group half">
                    <input
                      type="text"
                      name="metier"
                      value={formData.metier}
                      onChange={handleFormChange}
                      placeholder="Métier recherché *"
                      required
                    />
                  </div>
                </div>
                <div className="form-group photo-upload">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <button 
                    type="button" 
                    onClick={triggerFileInput}
                    className="upload-button"
                  >
                    {formData.photoPreview ? "Changer l'image" : "Ajouter une photo"}
                  </button>
                  {formData.photoPreview && (
                    <div className="image-preview">
                      <img src={formData.photoPreview} alt="Aperçu" />
                    </div>
                  )}
                </div>
                <div className="form-buttons">
                  <button type="button" onClick={cancelForm} className="cancel-button">
                    Annuler
                  </button>
                  <button type="submit" className="submit-button">
                    Créer ma demande
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="chatbot-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                aria-label="Message"
              />
              <button onClick={handleSend}>
                <SendIcon />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Icône d'envoi pour le bouton
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2L11 13"></path>
    <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
  </svg>
);

export default Chatbot;