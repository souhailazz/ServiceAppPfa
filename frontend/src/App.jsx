import { useState } from 'react'
import './App.css'
import SignUp from './Components/SignUp/SignUp'
import Login from  "./Components/Login/Login"
import HomePage from './Components/HomePage/HomePage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </div>  
    </Router>
  )
}

export default App