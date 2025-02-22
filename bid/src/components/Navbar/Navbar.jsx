import React from 'react'
import { BrowserRouter as Router,NavLink, Route, Routes } from "react-router-dom";
import '../../components/Navbar.css';
import logo_light from '../Navbar/assets/logo-black.png' 
import logo_dark from '../Navbar/assets/logo-white.png' 
import search_icon_light from '../Navbar/assets/search-w.png'
import search_icon_dark from '../Navbar/assets/search-b.png' 
import toogle_light from '../Navbar/assets/night.png' 
import toogle_dark from '../Navbar/assets/day.png'
import Home from './Home/Home';
import PostAuction from './PostAuction/PostAuction';
import LoginSignup from './LoginSignup/LoginSignup';
import AuctionItem from './item/AuctionItem'

const Navbar = ({theme, setTheme}) => {

    const toggle_mode = ()=>{
        theme == 'light' ? setTheme('dark') : setTheme('light');
    }
  return (
    <Router>
    <div className='navbar'>

      <img src ={theme == 'light' ? logo_light : logo_dark} alt="" className='logo'/>
      <ul>
        <li>
          <NavLink to={'/' } className="home-link">Home</NavLink>
        </li>
        <li>
          <NavLink to={'/Items'}className="home-link">Items</NavLink>
        </li>
        <li>
          <NavLink to={'/PostAuction'}className="home-link">Post Auction</NavLink>
        </li>
        <li>
          <NavLink to={'/Signup'}className="home-link">Signup</NavLink>
        </li>
      </ul>
      
      <div className='search-box'>
        <input type="test" placeholder='Search'/>
        <img src={theme == 'light' ? search_icon_light : search_icon_dark} alt=""/>

      </div>

      <img onClick={()=>{toggle_mode()}} src={theme == 'light' ? toogle_light : toogle_dark} alt="" className='toggle-icon'/>

    </div>
    <Routes>
      <Route path='/' element ={<Home/>}/>
      <Route path='/PostAuction' element ={<PostAuction/>}/>
      <Route path='/Signup' element ={<LoginSignup/>}/>
      <Route path='/AuctionItem' element ={<AuctionItem/>}/>
    </Routes>
    </Router>
  )
}

export default Navbar
