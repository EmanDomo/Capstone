import React, { useState } from 'react';
import '../../styles/Register.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    const fullName = e.target.elements.fullName.value;
    const gender = e.target.elements.gender.value;
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;
    const confirmPassword = e.target.elements.confirmPassword.value;

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fullName, gender, username, password }),
      });

      if (response.ok) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='Reg'>
      <div className='wrapper'>
        <form onSubmit={handleRegister}>
          <h1>Register</h1>
          {errorMessage && <p id='errormsg'>{errorMessage}</p>}
          {successMessage && <p id='successmsg'>{successMessage}</p>}
          <div className='input-box'>
            <input type='text' name='fullName' placeholder='Full Name' required />
          </div>
          <div className='input-box'>
            <select name='gender' required>
              <option value=''>Select Gender</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
            </select>
          </div>
          <div className='input-box'>
            <input type='text' name='username' placeholder='Username' required />
          </div>
          <div className='input-box'>
            <input type='password' name='password' placeholder='Password' required />
          </div>
          <div className='input-box'>
            <input type='password' name='confirmPassword' placeholder='Confirm Password' required />
          </div>

          <button type='submit'>Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
