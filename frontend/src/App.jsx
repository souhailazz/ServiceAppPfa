import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import SignUp from './Components/SignUp/SignUp'
import Login from './Components/Login/Login'
import HomePage from './Components/HomePage/HomePage'
import './App.css'
import DemandeDetails from "./Components/DemandeDetails/DemandeDetails";
import Profile from './Components/Profile/Profile'
import Demande from './Components/Demande/Demande'

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <nav>
            <Link to="/Login">Test</Link>
            <Link to="/signup">Register</Link>
            <Link to="/home">Accueil</Link>
            <Link to="/demande">Demande</Link>
            <Link to="/professionnel">Professionnel</Link>
            <Link to="/Profile">Profile</Link>

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
 
          <Route path="*" element={<h2>Page non trouvée</h2>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
