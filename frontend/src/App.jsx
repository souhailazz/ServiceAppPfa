import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignUp from'./Components/SignUp/SignUp'
import HomePage from './Components/HomePage/HomePage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/SignUp" />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </div>  
    </Router>
  )
}

export default App
