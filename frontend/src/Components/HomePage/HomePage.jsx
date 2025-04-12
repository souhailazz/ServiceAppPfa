import "./HomePage.css";
import photoSite from "../../assets/Images/photoSite.jpg";
import v2 from "../../assets/Images/v2.png"
import v3 from "../../assets/Images/v3.png"
import v4 from "../../assets/Images/v4.png"




const HomePage = () => {
 
    return (
      <div>
        {/* Hero Section */}
        <section
  className="hero"
  style={{ backgroundImage: `url(${photoSite})` }}
>
  <div className="hero-content">
    <h1>L'entraide entre voisins n'a jamais été aussi simple</h1>
    <p>
      AlloService connecte les personnes d'un même quartier pour échanger
      des services, des objets et créer du lien social.
    </p>
    <a href="#" className="cta-button">Découvrir</a>
  </div>
</section>

        {/* Features Section */}
        <section className="features" id="features">
          <div className="section-title">
            <h2>Nos services</h2>
            <p>
              AlloService facilite l'entraide et la solidarité dans votre
              quartier avec une plateforme simple et sécurisée.
            </p>
          </div>
  
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛠️</div>
              <h3>Services entre particuliers</h3>
              <p>
                Bricolage, jardinage, garde d'enfants, cours particuliers... Proposez ou
                trouvez de l'aide pour tous vos besoins quotidiens.
              </p>
            </div>
  
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Prêt et location d'objets</h3>
              <p>
                Partagez vos outils, équipements ou véhicules avec vos voisins.
                Économique et écologique !
              </p>
            </div>
  
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Communauté locale</h3>
              <p>
                Rejoignez un réseau de confiance dans votre quartier et participez
                à des initiatives locales.
              </p>
            </div>
          </div>
        </section>
  
        {/* How It Works */}
        <section className="how-it-works" id="how-it-works">
          <div className="section-title">
            <h2>Comment ça marche</h2>
            <p>
              En quelques étapes simples, commencez à échanger des services avec vos
              voisins.
            </p>
          </div>
  
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3> <a href="/signup">Inscrivez-vous</a></h3>
              <p>
                Créez votre profil gratuitement et rejoignez la communauté de votre
                quartier.
              </p>
            </div>
  
            <div className="step">
              <div className="step-number">2</div>
              <h3>Publiez ou trouvez</h3>
              <p>
                Proposez vos services ou parcourez les annonces disponibles près de
                chez vous.
              </p>
            </div>
  
            <div className="step">
              <div className="step-number">3</div>
              <h3>Échangez en confiance</h3>
              <p>
                Discutez, convenez des modalités et évaluez vos échanges après
                réalisation.
              </p>
            </div>
          </div>
        </section>
  
        {/* Testimonials */}
        <section className="testimonials" id="testimonials">
          <div className="section-title">
            <h2>Témoignages</h2>
            <p>Découvrez ce que nos utilisateurs disent de AlloService.</p>
          </div>
  
          <div className="testimonial-cards">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Grâce à AlloService, j'ai trouvé quelqu'un pour m'aider à monter un
                meuble et j'ai rencontré des voisins formidables. Une vraie communauté
                s'est créée dans notre immeuble !"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                <img
  src={v2}
  alt="Thomas"
  style={{
    width: '100%',
    height: 'auto',
    objectFit: 'contain', // ou 'cover' selon ce que tu veux
    filter: 'brightness(1)' // augmente la clarté si besoin
  }}
/>
                </div>
                <div>
                  <p className="author-name">Sophie D.</p>
                  <p className="author-location">Paris 11ème</p>
                </div>
              </div>
            </div>
  
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Je propose des cours de guitare sur la plateforme et c'est un excellent
                moyen de compléter mes revenus tout en rencontrant des gens sympas près
                de chez moi."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                <img
  src={v3}
  alt="Thomas"
  style={{
    width: '100%',
    height: 'auto',
    objectFit: 'contain', // ou 'cover' selon ce que tu veux
    filter: 'brightness(1)' // augmente la clarté si besoin
  }}
/>
                </div>
                <div>
                  <p className="author-name">Thomas M.</p>
                  <p className="author-location">Lyon 3ème</p>
                </div>
              </div>
            </div>
  
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Plus besoin d'acheter une perceuse que j'utilise deux fois par an ! Je
                la loue à mon voisin quand j'en ai besoin. Simple, pratique et
                économique."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                <img
  src={v4}
  alt="Thomass"
  style={{
    width: '100%',
    height: 'auto',
    objectFit: 'contain', // ou 'cover' selon ce que tu veux
    filter: 'brightness(1)' // augmente la clarté si besoin
  }}
/>
                </div>
                <div>
                  <p className="author-name">Émilie L.</p>
                  <p className="author-location">Bordeaux</p>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* CTA Section */}
        <section className="cta-section">
          <h2>Rejoignez la communauté AlloService</h2>
          <p>
            Des milliers de voisins vous attendent. Démarrez dès aujourd'hui et
            découvrez la puissance de l'entraide de proximité.
          </p>
          <div className="cta-buttons">
            <a href="/signup" className="cta-button">S'inscrire gratuitement</a>
            <a href="#" className="cta-button cta-secondary">En savoir plus</a>
          </div>
        </section>
  
        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-column">
              <h3>AlloService</h3>
              <p>
                La plateforme qui révolutionne l'entraide entre voisins et redonne
                vie aux quartiers.
              </p>
              <div className="social-icons">
                <a href="#" className="social-icon">📱</a>
                <a href="#" className="social-icon">💻</a>
                <a href="#" className="social-icon">📷</a>
              </div>
            </div>
  
            <div className="footer-column">
              <h3>Navigation</h3>
              <ul className="footer-links">
                <li><a href="#">Accueil</a></li>
                <li><a href="#features">Services</a></li>
                <li><a href="#how-it-works">Comment ça marche</a></li>
                <li><a href="#testimonials">Témoignages</a></li>
              </ul>
            </div>
  
            <div className="footer-column">
              <h3>Informations</h3>
              <ul className="footer-links">
                <li><a href="#">À propos de nous</a></li>
                <li><a href="#">Conditions d'utilisation</a></li>
                <li><a href="#">Politique de confidentialité</a></li>
                <li><a href="#">Nous contacter</a></li>
              </ul>
            </div>
  
            <div className="footer-column">
              <h3>Aide</h3>
              <ul className="footer-links">
                <li><a href="#">Centre d'aide</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Sécurité</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
          </div>
  
          <div className="footer-bottom">
            <p>&copy; 2025 AlloService. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    );
  };
  

  

  
  export default HomePage;