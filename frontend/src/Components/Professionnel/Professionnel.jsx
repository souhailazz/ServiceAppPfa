import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Professionnel.css';

const Professionnel = () => {
    const [metiers, setMetiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMetiers = async () => {
            try {
                const response = await axios.get('http://localhost:5207/api/Professionnel/metiers-avec-professionnels');
                console.log('API Response:', response.data); // Debug the response
                
                // Ensure we have an array to work with
                if (Array.isArray(response.data)) {
                    setMetiers(response.data);
                } else if (response.data && typeof response.data === 'object') {
                    // If it's an object with properties that might contain our data
                    // Convert to array if possible
                    const metiersArray = Object.values(response.data);
                    if (Array.isArray(metiersArray) && metiersArray.length > 0) {
                        setMetiers(metiersArray);
                    } else {
                        // If we can't find an array, wrap the object in an array
                        setMetiers([response.data]);
                    }
                } else {
                    throw new Error('Format de données inattendu');
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Erreur lors du chargement des métiers:', err);
                setError('Impossible de charger les données. Veuillez réessayer plus tard.');
                setLoading(false);
            }
        };

        fetchMetiers();
    }, []);

    const handleProfessionnelClick = (id) => {
        navigate(`/professionnel/${id}`);
    };

    const handleShowAllClick = (metier) => {
        navigate(`/professionnels/${metier}`);
    };

    if (loading) return <div className="loading">Chargement des professionnels...</div>;
    if (error) return <div className="error">{error}</div>;

    // If metiers is still not an array after our checks, use an empty array
    const metiersToRender = Array.isArray(metiers) ? metiers : [];

    // If we have no data after loading
    if (metiersToRender.length === 0) {
        return <div className="error">Aucun professionnel trouvé.</div>;
    }

    return (
        <div className="professionnels-container">
            <h1 className="page-title">Professionnels par Métier</h1>
            
            {metiersToRender.map((metierGroup, index) => {
                // Skip if metierGroup doesn't have the expected structure
                if (!metierGroup || !metierGroup.metier || !Array.isArray(metierGroup.professionnels)) {
                    console.warn('Groupe de métier invalide:', metierGroup);
                    return null;
                }
                
                return (
                    <div key={metierGroup.metier || index} className="metier-box">
                        <h2 className="metier-title">{metierGroup.metier}</h2>
                        
                        <div className="professionnels-grid">
                            {metierGroup.professionnels.map((pro, proIndex) => {
                                // Skip if professional is missing required data
                                if (!pro) return null;
                                
                                return (
                                    <div 
                                        key={pro.id || `pro-${proIndex}`} 
                                        className="professionnel-card"
                                        onClick={() => handleProfessionnelClick(pro.id)}
                                    >
                                        <div className="professionnel-image">
                                            {pro.photoUrl ? (
                                                <img src={pro.photoUrl} alt={`${pro.prenom || ''} ${pro.nom || ''}`} />
                                            ) : (
                                                <div className="placeholder-image">
                                                    <span>
                                                        {(pro.prenom && pro.prenom.charAt(0) || '') + 
                                                         (pro.nom && pro.nom.charAt(0) || '')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="professionnel-info">
                                            <h3>{pro.prenom || ''} {pro.nom || ''}</h3>
                                            {pro.ville && <p className="location">{pro.ville}</p>}
                                            <div className="rating">
                                                {renderStars(pro.moyenneNote || 0)}
                                                <span className="rating-value">
                                                    {typeof pro.moyenneNote === 'number' ? pro.moyenneNote.toFixed(1) : '0.0'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {metierGroup.professionnels.length > 0 && (
                            <button 
                                className="show-all-button"
                                onClick={() => handleShowAllClick(metierGroup.metier)}
                            >
                                Voir tous les {metierGroup.metier}s
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Helper function to render stars based on rating
const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<span key={i} className="star full">★</span>);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(<span key={i} className="star half">★</span>);
        } else {
            stars.push(<span key={i} className="star empty">☆</span>);
        }
    }
    
    return stars;
};

export default Professionnel;