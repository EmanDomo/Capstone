import { useNavigate } from "react-router-dom";
import Logo from "../../Assets/logo.png";
import Bg from "../../Assets/bg.jpg";
import '../../styles/Homepage.css';
import Dropdown from 'react-bootstrap/Dropdown';

const Homepage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <nav className="navbar navbar-light bg-transparent justify-content-between">
                <div className="d-flex align-items-center">
                    <img src={Logo} className="logo-home1" alt="logo" />
                    <h3 className="d-none d-lg-block ms-2 text-white mt-3">SJISC Canteen</h3>
                </div>
                <Dropdown className="position-absolute top-0 end-0 display-5 m-3">
                    <Dropdown.Toggle variant="success" id="dropdown-home">Login</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item id="dropdown-menu" onClick={() => navigate('/loginform')}>Cashier</Dropdown.Item>
                        <Dropdown.Item id="dropdown-menu" onClick={() => navigate('/superadmin')}>Admin</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </nav>

            <img src={Bg} id="home-bg" alt="" />
            <button onClick={() => navigate('/userlogin')}  id="btn">ORDER NOW!</button>
        </div>
    );
}

export default Homepage;