import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Professionnel.css';

const Professionnel = () => {
    const [metiers, setMetiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMetier, setSelectedMetier] = useState("");
    const [selectedVille, setSelectedVille] = useState("");
    const [allVilles, setAllVilles] = useState([]);
    const [allMetiers, setAllMetiers] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const navigate = useNavigate();
    const metiersList = [
        "Plombier", "Électricien", "Mécanicien", "Jardinier", 
        "Menuisier", "Peintre", "Tolier"
    ];

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await axios.get('http://localhost:5207/api/Professionnel/metiers-avec-professionnels');
                console.log('API Response:', response.data);
                
                if (Array.isArray(response.data)) {
                    setMetiers(response.data);
                    setOriginalData(response.data);
                    
                    // Extract all unique cities from the data
                    const villes = new Set();
                    const metierNames = new Set();
                    
                    response.data.forEach(metierGroup => {
                        if (metierGroup.metier) {
                            metierNames.add(metierGroup.metier);
                        }
                        
                        if (Array.isArray(metierGroup.professionnels)) {
                            metierGroup.professionnels.forEach(pro => {
                                if (pro.ville) {
                                    villes.add(pro.ville);
                                }
                            });
                        }
                    });
                    
                    setAllVilles(Array.from(villes).sort());
                    setAllMetiers(Array.from(metierNames).sort());
                } else if (response.data && typeof response.data === 'object') {
                    const metiersArray = Object.values(response.data);
                    if (Array.isArray(metiersArray) && metiersArray.length > 0) {
                        setMetiers(metiersArray);
                        setOriginalData(metiersArray);
                    } else {
                        setMetiers([response.data]);
                        setOriginalData([response.data]);
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

        fetchInitialData();
    }, []);

    // Filter effect when selections change
    useEffect(() => {
        const applyFilters = async () => {
            if (!selectedMetier && !selectedVille) {
                // If no filters, show original data
                setMetiers(originalData);
                return;
            }
            
            setLoading(true);
            
            try {
                if (selectedMetier) {
                    const response = await axios.get(`http://localhost:5207/api/Professionnel/professionnels-par-metier?metier=${selectedMetier}${selectedVille ? `&ville=${selectedVille}` : ''}`);
                    console.log('Filter Response:', response.data);
                    
                    if (Array.isArray(response.data)) {
                        // Format response to match expected structure
                        const formattedData = [{
                            metier: selectedMetier,
                            professionnels: response.data
                        }];
                        setMetiers(formattedData);
                    } else {
                        setMetiers([]);
                    }
                } else if (selectedVille) {
                    // Filter original data by ville
                    const filteredData = originalData.map(metierGroup => {
                        return {
                            ...metierGroup,
                            professionnels: metierGroup.professionnels.filter(pro => 
                                pro.ville === selectedVille
                            )
                        };
                    }).filter(metierGroup => metierGroup.professionnels.length > 0);
                    
                    setMetiers(filteredData);
                }
            } catch (err) {
                console.error('Erreur lors du filtrage:', err);
                setError('Impossible de filtrer les données. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false);
            }
        };
        
        applyFilters();
    }, [selectedMetier, selectedVille, originalData]);

    const handleMetierChange = (e) => {
        setSelectedMetier(e.target.value);
    };

    const handleVilleChange = (e) => {
        setSelectedVille(e.target.value);
    };

    const resetFilters = () => {
        setSelectedMetier("");
        setSelectedVille("");
    };

    const handleProfessionnelClick = (id) => {
        navigate(`/professionnel/${id}`);
    };

    const handleShowAllClick = (metier) => {
        navigate(`/professionnels/${metier}`);
    };

    if (loading && metiers.length === 0) {
        return <div className="loading">Chargement des professionnels...</div>;
    }
    
    if (error) {
        return <div className="error">{error}</div>;
    }

    const metiersToRender = Array.isArray(metiers) ? metiers : [];

    return (
        <div className="professionnels-container">
            <h1 className="page-title">Professionnels par Métier</h1>
            
            <div className="filters-container">
                <div className="filter-group">
                    <label htmlFor="metier-select">Métier:</label>
                    <select 
                        id="metier-select"
                        value={selectedMetier}
                        onChange={handleMetierChange}
                    >
                        <option value="">Tous les métiers</option>
                        {metiersList.map(metier => (
                            <option key={metier} value={metier}>{metier}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="ville-select">Ville:</label>
                    <select 
                        id="ville-select"
                        value={selectedVille}
                        onChange={handleVilleChange}
                    >
                        <option value="">Toutes les villes</option>
                        {allVilles.map(ville => (
                            <option key={ville} value={ville}>{ville}</option>
                        ))}
                    </select>
                </div>
                
                <button onClick={resetFilters} className="reset-button">Réinitialiser</button>
            </div>
            
            {loading && <div className="loading overlay">Mise à jour des résultats...</div>}
            
            {!loading && metiersToRender.length === 0 && (
                <div className="error">Aucun professionnel trouvé pour ces critères.</div>
            )}
            
            {metiersToRender.map((metierGroup, index) => {
                // Skip if metierGroup doesn't have the expected structure
                if (!metierGroup || !metierGroup.metier || !Array.isArray(metierGroup.professionnels)) {
                    console.warn('Groupe de métier invalide:', metierGroup);
                    return null;
                }
                
                // Skip empty professional lists unless we're explicitly filtering
                if (metierGroup.professionnels.length === 0 && !selectedMetier && !selectedVille) {
                    return null;
                }
                
                return (
                    <div key={metierGroup.metier || index} className="metier-box">
                        <h2 className="metier-title">{metierGroup.metier}</h2>
                        
                        {metierGroup.professionnels.length === 0 ? (
                            <div className="no-results">Aucun professionnel trouvé dans cette catégorie.</div>
                        ) : (
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
                        )}
                        
                        {metierGroup.professionnels.length > 0 && !selectedMetier && (
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