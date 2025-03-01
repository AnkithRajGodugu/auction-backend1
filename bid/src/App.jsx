import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar/Navbar'
import './App.css'
import './components/Navbar/Home/Home'





const App = () => {

  


  const current_theme = localStorage.getItem('current_theme');
  const [theme, setTheme] = useState(current_theme ? current_theme : 'light');

  useEffect(()=>{
    localStorage.setItem('current_theme', theme);

  },[theme])
  
  return (
    
    
   
  <div>
  
    <div className={`container ${theme}`}>

      <Navbar theme={theme} setTheme={setTheme}/>
      
    </div>
    
     {/* <div >  */}
     {/* <LoginSignup/> */}
     {/* </div> */}
  </div>

    
    
  )
}


export default App;

