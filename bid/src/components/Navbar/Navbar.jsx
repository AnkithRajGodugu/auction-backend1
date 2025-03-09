import React, { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import '../../components/Navbar.css';
import logo_light from '../Navbar/assets/logo-black.png';
import logo_dark from '../Navbar/assets/logo-white.png';
import search_icon_light from '../Navbar/assets/search-w.png';
import search_icon_dark from '../Navbar/assets/search-b.png';
import toogle_light from '../Navbar/assets/night.png';
import toogle_dark from '../Navbar/assets/day.png';

const Navbar = ({ theme, setTheme, isAuthenticated, setIsAuthenticated }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const toggle_mode = () => {
        theme === 'light' ? setTheme('dark') : setTheme('light');
    };

    const handleSearch = (e) => {
        e.preventDefault(); // Prevent form submission from refreshing the page
        if (searchQuery.trim()) {
            console.log("Searching for:", searchQuery);
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery(""); // Clear input after search
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch(e);
        }
    };

    return (
        <div className='navbar'>
            <img src={theme === 'light' ? logo_light : logo_dark} alt="Logo" className='logo' />
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
                        <NavLink
                            to={'/Logout'}
                            className="home-link"
                            onClick={(e) => {
                                e.preventDefault();
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                setIsAuthenticated(false);
                                navigate("/login");
                            }}
                        >
                            Logout
                        </NavLink>
                    </li>
                ) : (
                    <li>
                        <NavLink to={'/signup'} className="home-link">Signup</NavLink>
                    </li>
                )}
            </ul>
            <div className='search-box'>
                <input
                    type="text"
                    placeholder='Search'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress} // Trigger search on Enter
                />
                <img
                    src={theme === 'light' ? search_icon_light : search_icon_dark}
                    alt="Search"
                    onClick={handleSearch} // Trigger search on icon click
                    style={{ cursor: "pointer" }} // Make icon clickable
                />
            </div>
            <img
                onClick={toggle_mode}
                src={theme === 'light' ? toogle_light : toogle_dark}
                alt="Toggle Theme"
                className='toggle-icon'
            />
        </div>
    );
};

export default Navbar;