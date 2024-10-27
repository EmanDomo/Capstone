import '../../styles/Draft.css';
import { useNavigate } from "react-router-dom";
import Logo from "../../Assets/logo.png";
import Bg from "../../Assets/bg.jpg";
import Dropdown from 'react-bootstrap/Dropdown';
import homepage from "../../Assets/homepage.jpg";
import Button from 'react-bootstrap/Button';


const Draft = () => {
    const navigate = useNavigate();
    return ( 
        <div className='drafthome'>
            <nav className="navbar navbar-light bg-transparent justify-content-between">
                <div className="d-flex align-items-center">
                    <img src={Logo} className="logo-home1" alt="logo" />
                    <h3 className="d-none d-lg-block ms-2 text-white mt-3">SJISC Canteen</h3>
                </div>
                <Dropdown className="position-absolute top-0 end-0 display-5 m-3">
                    <Dropdown.Toggle variant="success" id="dropdown-home">Login</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item id="dropdown-menu" className="text-center" onClick={() => navigate('/loginform')}>Cashier</Dropdown.Item>
                        <Dropdown.Item id="dropdown-menu" className="text-center" onClick={() => navigate('/superadmin')}>Admin</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </nav>

            <div className='container homemain'>
                <div className='row'>
                    <div className='col-12 col-lg-6 col-sm-12'>
                        <h1 class="display-1 title-home">We invite you to our restaurant</h1>
                        <p class="card-text">With supporting text below as a natural lead-in to additional content. With supporting text below as a natural lead-in to additional content.</p>
                        <Button variant="dark" id='home-orderbtn' onClick={() => navigate('/userlogin')}>ORDER NOW</Button>
                    </div>
                    <div className='col-12 col-lg-6 col-sm-12 m-auto d-flex justify-content-center align-items-center'>
                        <img src={homepage} className='home-image' />          
                    </div>
                </div>
               
            </div>
        </div>
     );
}
 
export default Draft;