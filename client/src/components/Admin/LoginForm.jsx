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
        navigate('/admin');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div id="card">
        <div id="logo-container">
          <FaArrowLeft id='ad-close' onClick={() => navigate('/')} />
          <img src={Logo} id="logo" alt="logo" />
        </div>
        <div className="inpt">
        <form onSubmit={handleLogin}>
          {errorMessage && <p id='errormsg'>{errorMessage}</p>}
          <div className="input-box" id="inputbx">
          <h6 id='lblAdminLogin'>Admin Login</h6>
            <FaUser className="icon"/>
            <input type='text' name='username' id="input-admin" placeholder='Username' required />
          </div>
          <div className="input-box">
            <FaLock className="icon"/>
            <input type={showPassword ? "text" : "password"} name='password' id="input-admin" placeholder='Password' required />

                        
          {showPassword ? (
                <IoMdEyeOff className="icon3" id="hidePass" onClick={togglePasswordVisibility} />
              ) : (
                <IoMdEye className="icon3" id="showPass" onClick={togglePasswordVisibility} />
              )}
          </div>

          {/* <div className='remember-forgot'>
            <label>
              <input type='checkbox' />
              Remember me
            </label>
            <a href='#'>Forgot password?</a>
          </div> */}

          <button id="login" type='submit'>Login</button>

          {/* <div className='register-link'>
            <p>
              Don't have an account?<a href='#'>Register</a>
            </p>
          </div> */}
        </form>
        </div>
      </div>
    </div>
  );
};

export default Login;