import { useState } from 'react'
import { DataProvider } from './DataContext';
import { AuthProvider } from './AuthContext';
import LoginModal from "./Home/LoginModal";
import Navbar from './Navbar';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AppRoutes from './routes';
function App() {

  return (
    <AuthProvider>
      <DataProvider>
        <Router basename="/Client/">
          <Navbar />
          <LoginModal />
          <div >
            <AppRoutes />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>

  )
}

export default App
