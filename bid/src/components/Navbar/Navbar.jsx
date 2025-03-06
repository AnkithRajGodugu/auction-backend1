import React from 'react';
import { NavLink } from "react-router-dom";
import '../../components/Navbar.css';
import logo_light from '../Navbar/assets/logo-black.png';
import logo_dark from '../Navbar/assets/logo-white.png';
import search_icon_light from '../Navbar/assets/search-w.png';
import search_icon_dark from '../Navbar/assets/search-b.png';
import toogle_light from '../Navbar/assets/night.png';
import toogle_dark from '../Navbar/assets/day.png';

const Navbar = ({ theme, setTheme, isAuthenticated, setIsAuthenticated }) => {
    const toggle_mode = () => {
        theme === 'light' ? setTheme('dark') : setTheme('light');
    };

    return (
        <div className='navbar'>
            <img src={theme === 'light' ? logo_light : logo_dark} alt="" className='logo' />
            <ul>
                <li>
                    <NavLink to={'/'} className="home-link">Home</NavLink>
                </li>
                <li>
                    <NavLink to={'/Categories'} className="home-link">Categories</NavLink>
                </li>
                <li>
                    <NavLink to={'/Products'} className="home-link">Items</NavLink>
                </li>
                {isAuthenticated ? (
                    <li>
                        <NavLink to={'/Logout'} className="home-link" onClick={() => setIsAuthenticated(false)}>Logout</NavLink>
                    </li>
                ) : (
                    <li>
                        <NavLink to={'/signup'} className="home-link">Signup</NavLink>
                    </li>
                )}
            </ul>
            <div className='search-box'>
                <input type="text" placeholder='Search' />
                <img src={theme === 'light' ? search_icon_light : search_icon_dark} alt="" />
            </div>
            <img onClick={toggle_mode} src={theme === 'light' ? toogle_light : toogle_dark} alt="" className='toggle-icon' />
        </div>
    );
};

export default Navbar;
