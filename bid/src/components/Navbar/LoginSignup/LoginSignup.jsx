import React, { useState } from 'react';
import axios from 'axios'; // Import axios for API calls

import '../../../components/LoginSignup.css';

import user_icon from '../assets/person.png';
import email_icon from '../assets/email.png';
import password_icon from '../assets/password.png';

const LoginSignup = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // State for name during signup
    const [action, setAction] = useState("SignUp");

    return (
        <div className='Lcontainer'>
            <div className="header">
                <div className="text">{action}</div>
                <div className="underline"></div>
            </div>
            <div className="inputs">
                {action === "Login" ? null : (
                    <div className="input">
                        <img src={user_icon} alt="" />
                        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                )}
                <div className="input">
                    <img src={email_icon} alt="" />
                    <input type="email" placeholder="Email Id" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input">
                    <img src={password_icon} alt="" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            </div>
            {action === "Sign Up" ? null : (
                <div className="forgot-password">Lost Password?<span>Click Here</span></div>
            )}
            <div className="submit-container" onClick={async () => {
                const userData = { name, email, password }; 
                const url = action === "Sign Up" ? '/api/signup' : '/api/login'; // Define the API endpoint based on action
                try {
                    const response = await axios.post(url, userData);
                    console.log(response.data); // Handle successful response
                    setIsAuthenticated(true); // Update authentication state on successful login/signup
                } catch (error) {
                    console.error("Error during authentication:", error);
                    // Display error message to the user
                    alert("Authentication failed: " + error.response.data.error);
                }
            }}>
                <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => { setAction("Sign Up") }}>Sign Up</div>
                <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => { setAction("Login") }}>Login</div>
            </div>
        </div>
    );
}

export default LoginSignup;
