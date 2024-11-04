
import React, { useState } from 'react';
import '../../styles/LoginForm.css';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Logo from "../../Assets/logo.png";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa6";

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    try {
      const response = await fetch('http://localhost:3000/LoginForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Store the token in local storage
        navigate('/pos'); // Redirect to POS dashboard
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);

        // Only set remainingAttempts if it exists in the response
        if (errorData.remainingAttempts !== undefined) {
          setRemainingAttempts(errorData.remainingAttempts);
        } else {
          setRemainingAttempts(null); // Clear attempts if account is locked
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div id="card-cashier">
        <div id="logo-container-cashier">
          <FaArrowLeft id='ad-close-cashier' onClick={() => navigate('/')} />
          <img src={Logo} id="logo-cashier" alt="logo" />
        </div>
        <div className="inpt-cashier">
        <form onSubmit={handleLogin}>
          {errorMessage && <p id='errormsg-cashier'>{errorMessage}</p>}
          <div className="input-box-cashier" id="inputbx-cashier">
          <h6 id='lblCashierLogin'>Cashier Login</h6>
            <FaUser className="icon-cashier"/>
            <input type='text' name='username' id="input-cashier" placeholder='Username' required />
          </div>
          <div className="input-box-cashier">
            <FaLock className="icon-cashier"/>
            <input type={showPassword ? "text" : "password"} name='password' id="input-cashier" placeholder='Password' required />

                        
          {showPassword ? (
                <IoMdEyeOff className="icon3-cashier" id="hidePass" onClick={togglePasswordVisibility} />
              ) : (
                <IoMdEye className="icon3-cashier" id="showPass" onClick={togglePasswordVisibility} />
              )}
          </div>
          <button id="login-cashier" className='text-white' type='submit'>Login</button>
        </form>
          {remainingAttempts !== null && (
              <p className="attempts-message text-secondary">Attempts remaining: {remainingAttempts}</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;