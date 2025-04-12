import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SignUp from './Components/SignUp/SignUp'
import Login from './Components/Login/Login'
import HomePage from './Components/HomePage/HomePage'
import './App.css'
import DemandeDetails from "./Components/DemandeDetails/DemandeDetails";
import Profile from './Components/Profile/Profile'
import Demande from './Components/Demande/Demande'
import logo from "./assets/Images/image.png";
import Professionnel from './Components/Professionnel/Professionnel'
import ProfessionnelDetails from './Components/ProfessionnelDetails/ProfessionnelDetails'

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Initial check
    const userId = sessionStorage.getItem('userId');
    setIsLoggedIn(!!userId);

    // Listen for storage changes
    const handleStorageChange = () => {
      const userId = sessionStorage.getItem('userId');
      setIsLoggedIn(!!userId);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    setIsLoggedIn(false);
    window.location.href = '/Login';
  };

  return (
    <Router>
      <div className="App">
        <header>
        <nav>
  <div className="logo">
    <Link to="/home">
      <img src={logo} alt="ALLoService Logo" />
    </Link>
  </div>

  <button 
    className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
    onClick={() => setMenuOpen(!menuOpen)}
  >
    <span></span>
  </button>

  <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
    {!isLoggedIn && <Link to="/signup">Register</Link>}
    <Link to="/home">Accueil</Link>
    <Link to="/demande">Demande</Link>
    <Link to="/professionnel">Professionnel</Link>

    {isLoggedIn ? (
      <>
        <Link to="/Profile">Profile</Link>
        <button onClick={handleLogout} className="logout-button">Déconnexion</button>
      </>
    ) : (
      <Link to="/Login">Login</Link>
    )}
  </div>
</nav>

        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/demande" element={<Demande />} />
          <Route path="/demande/:id" element={<DemandeDetails />} />
          <Route path="/Profile" element={<Profile />} /> 
          <Route path="/Professionnel" element={<Professionnel />} /> 
          <Route path="/professionnel/:id" element={<ProfessionnelDetails />} />
          <Route path="*" element={<h2>Page non trouvée</h2>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
