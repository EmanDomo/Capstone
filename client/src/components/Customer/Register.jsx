import React, { useState } from 'react';
import '../../styles/Register.css';
import { useNavigate } from 'react-router-dom';
import { Toast, ToastContainer } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { host } from '../../apiRoutes';

const Register = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${host}/Register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, gender, username, password }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/userlogin');
          e.target.reset();
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className='Reg'>
      <div className='wrapper'>
        <form onSubmit={handleRegister}>
          <h1 id='register-title'>Register</h1>
          {errorMessage && <p id='errormsg'>{errorMessage}</p>}
          <div className='input-box'>
            <input type='text' name='fullName' placeholder='Full Name' required />
          </div>
          <div className='input-box'>
            <select className="option" name='gender' required>
              <option value=''>Select Gender</option>
              <option className="optionr" value='Male'>Male</option>
              <option className="optionr" value='Female'>Female</option>
            </select>
          </div>
          <div className='input-box'>
            <input type='text' name='username' placeholder='Username' required />
          </div>
          <div className='input-box'>
            <input
              type={showPassword ? 'text' : 'password'}
              name='password'
              placeholder='Password'
              required
            />
            {showPassword ? (
              <IoMdEyeOff className="iconr" onClick={togglePasswordVisibility} />
            ) : (
              <IoMdEye className="iconr" onClick={togglePasswordVisibility} />
            )}
          </div>
          <div className='input-box'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name='confirmPassword'
              placeholder='Confirm Password'
              required
            />
            {showConfirmPassword ? (
              <IoMdEyeOff className="iconr" onClick={toggleConfirmPasswordVisibility} />
            ) : (
              <IoMdEye className="iconr" onClick={toggleConfirmPasswordVisibility} />
            )}
          </div>
          <div className='btnscont d-flex justify-content-between'>
            <Button type='submit' variant="dark" className='btnRegister'>Register</Button>
            <Button variant="dark" onClick={() => navigate('/')}>Cancel</Button>
          </div>
        </form>

        <ToastContainer className="p-3" position="middle-center">
          <Toast show={showSuccess} onClose={() => setShowSuccess(false)} delay={3000} autohide>
            <Toast.Header>
              <strong className="me-auto">Success</strong>
              <small>Just now</small>
            </Toast.Header>
            <Toast.Body>Registration successful! Redirecting to login...</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </div>
  );
};

export default Register;
