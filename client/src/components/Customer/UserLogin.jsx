import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CloseButton from 'react-bootstrap/CloseButton';  
import '../../styles/Login.css';
import { useNavigate } from "react-router-dom";
import Logo from "../../Assets/logo.png";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { IoMdPerson } from "react-icons/io";
import { FaUnlock } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import React, { useState, useRef } from 'react';
import { host } from '../../apiRoutes';

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();  

    const username = formRef.current.username.value; 
    const password = formRef.current.password.value;

    try {
      const response = await fetch(`${host}/UserLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); 
        navigate('/menu');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);

        if (errorData.remainingAttempts !== undefined) {
          setRemainingAttempts(errorData.remainingAttempts);
        } else {
          setRemainingAttempts(null);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-main">
      <Card className="login-card d-flex flex-column">
        <Card.Header className="login-card-header text-center position-relative">
          <div className="d-flex justify-content-end">
            <CloseButton
              className="text-white"
              onClick={() => navigate('/')}
            />
          </div>
          <img src={Logo} className="login-header-logo mt-1" alt="Logo" />
        </Card.Header>
        <Card.Body className="d-flex flex-column flex-grow-1">
          <Card.Title className="text-center fs-6 card-title">Customer Login</Card.Title>
          <div>
            <form ref={formRef} onSubmit={handleLogin}>
              <div className="login-body mt-5">
                <InputGroup className="mb-2 input-group">
                  <InputGroup.Text className="login-body-icon">
                    <IoMdPerson className="fs-5" />
                  </InputGroup.Text>
                  <Form.Control
                    name="username"
                    type="text"
                    placeholder="Enter username"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    className="login-body-input"
                    required
                  />
                  <InputGroup.Text className="hidden-icon">
                    <IoMdPerson className="fs-5" />
                  </InputGroup.Text>
                </InputGroup>

                <InputGroup className="mb-3 mt-4 input-group">
                  <InputGroup.Text className="login-body-icon">
                    <FaUnlock className="fs-5" />
                  </InputGroup.Text>
                  <Form.Control
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    aria-label="Password"
                    aria-describedby="basic-addon1"
                    className="login-body-input"
                    required
                  />
                  <InputGroup.Text
                    className="login-body-icon"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaRegEyeSlash className="fs-5" /> : <FaRegEye className="fs-5" />}
                  </InputGroup.Text>
                </InputGroup>
              </div>
            </form>
          </div>
        </Card.Body>
        <Card.Body className='pt-0 pb-0'>
        {errorMessage && <p className="text-center text-danger lh-1">{errorMessage}</p>}
              {remainingAttempts !== null && (
                <p className="attempts-message text-secondary text-center lh-1">
                  Attempt(s) remaining: {remainingAttempts}
                </p>
              )}
        </Card.Body>
        <Card.Footer className='login-mainfooter'>
          <div className="login-footer-container mt-auto text-center">
            <Button variant="dark" className="login-footer" onClick={handleLogin}>
              Login
            </Button>
            <div className="register-link mt-2">
              <p className="text-center">
                Don't have an account?{' '}
                <a id="student-register" onClick={handleRegister}>
                  Register
                </a>
              </p>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Login;
