// Footer.jsx
import React from 'react';
import "../../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Saint Jerome Integrated School of Cabuyao. All Rights Reserved.</p>
        {/* <ul className="footer-links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul> */}
      </div>
    </footer>
  );
};

export default Footer;
