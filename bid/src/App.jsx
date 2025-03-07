import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar/Navbar';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Navbar/Home/Home';
import Categories from './components/Navbar/Categories/Categories.'
import LoginSignup from './components/Navbar/LoginSignup/LoginSignup';
import Products from './components/Navbar/item/Products';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const current_theme = localStorage.getItem('current_theme');
  const [theme, setTheme] = useState(current_theme ? current_theme : 'light');

  useEffect(() => {
    localStorage.setItem('current_theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        console.log(response.data); // Handle the fetched products as needed
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Router>
      <div className={`container ${theme}`}>
        <Navbar theme={theme} setTheme={setTheme} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<LoginSignup setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/Categories" element={<Categories />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
