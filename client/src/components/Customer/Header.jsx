import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Header.css';

const Header = () => {
  const [openLinks, setOpenLinks] = useState(false);

  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };

  return (
    <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <div>
          <h2>STI</h2>
        </div>
      </div>
      <div className="rightSide">
        <Link to="/"> Home </Link>
        <Link to="/Menu"> Menu </Link>
        <button onClick={toggleNavbar}>
          {/* Menu button icon, if any */}
        </button>
      </div>
    </div>
  );
};

export default Header;
