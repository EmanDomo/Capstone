import '../../styles/Homepage.css';
import { useNavigate } from "react-router-dom";
import Logo from "../../Assets/logo.png";
import Bg from "../../Assets/bg.jpg";
import Dropdown from 'react-bootstrap/Dropdown';
import homepage from "../../Assets/homepage.jpg";
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Logo1 from "../../Assets/logo.png";
import { Container} from 'react-bootstrap';
import { FaFacebook } from "react-icons/fa";
import { BiLogoGmail } from "react-icons/bi";
import { FaPhone } from "react-icons/fa6";
import Carousel from 'react-bootstrap/Carousel';

var heroData = [
    {
      id: 1,
      image: require('../../Assets/bg.jpg')
    },
    {
      id: 2,
      image: require('../../Assets/announcement.png')
    },
    {
      id: 3,
      image: require('../../Assets/silog3.jfif')
    }
  ]

const Homepage = () => {
    const navigate = useNavigate();
    return ( 
        <div className='drafthome'>
            <Navbar expand="lg" sticky="top" className="bg-body-tertiary home-nav">
                <Container>
                    <Navbar.Brand href="/">
                    <div className='d-flex'>
                    <img
                        alt="Logo"
                        src={Logo1}
                        className="d-inline-block align-top logo-home"
                    />{' '}
                        <label className="d-none d-lg-block mt-3" id='header-home-title'>Saint Jerome Integrated School of Cabuyao</label>
                        <label className="d-block d-lg-none text-white mt-3" >SJISC Canteen</label>
                    </div>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" id='toggle-nav-home'/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto mt-1">
                            <Nav.Link href="#about-home" className='abt-home text-white'> About </Nav.Link> 
                        </Nav>
                    </Navbar.Collapse>
                    <Dropdown className="position-absolute top-0 end-0 display-5 m-3">
                            <Dropdown.Toggle variant="success" id="dropdown-home">Login</Dropdown.Toggle>
                                <Dropdown.Menu className='dropdown-menu-container'>
                                    <Dropdown.Item id="dropdown-menu" className="text-center" onClick={() => navigate('/loginform')}>Cashier</Dropdown.Item>
                                    <Dropdown.Item id="dropdown-menu" className="text-center" onClick={() => navigate('/superadmin')}>Admin</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>  
                </Container>
            </Navbar>
            <div className='container homemain'>
                <div className='row'>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-12'>
                        <h1 className="display-1 title-home">We invite you to our Canteen</h1>
                        <p className="card-text lh-lg">Saint Jerome Integrated School of Cabuyao community! Transform your mealtime with our quick and easy canteen ordering system! Say goodbye to long lines and hello to delicious, nutritious meals at your fingertips. Whether you’re in the mood for a hearty lunch or a tasty snack, we’ve got you covered. Plus, every order supports our vibrant school spirit. Don’t miss out—order today and elevate your dining experience!</p>
                        <Button variant="dark" id='home-orderbtn' onClick={() => navigate('/userlogin')}>ORDER NOW</Button>
                    </div>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-12 m-auto d-flex justify-content-center align-items-center'>
                        <img src={homepage} className='home-image' />          
                    </div>
                </div>

                <div className='home-carousel'>
                    <div className="bg-warning hero-block-home mx-2 my-3">
                        <Carousel>
                            {heroData.map(hero => (
                                <Carousel.Item key={hero.id}>
                                    <img
                                        className="d-block w-100"
                                        src={hero.image}
                                        alt={"slide " + hero.id}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </div>
                </div>

                <div>
                <section id='about-home'>
                    <h4 className='text-center text-white'>About Us</h4>
                    <div className="aboutcontainer"></div>
                    <p className='about-content lh-lg mb-5'>St. Jerome Integrated School in Cabuyao, Laguna, established itself as an educational institution in 1997. Its humble beginnings featured a kindergarten course with just 32 students under the guidance of Mrs. Alicia O. Tolentino, the school's owner and an educator by profession. Over the years, the school expanded its offerings, introducing a preparatory program in 1998, an elementary department in 1999, and finally achieving government recognition for its secondary course in 2012. The addition of the Senior High School in 2016 marked a significant milestone, offering academic strands in STEM, ABM, and GAS.</p>
               </section>
                </div>
            </div>
            <div id='contact-home'></div>

            <div className='text-center mt-5 pt-3 bg-dark text-white fb'>
    <div className='d-flex justify-content-center'>
        <a href='https://www.facebook.com/officialsjisc' target="_blank" rel="noopener noreferrer">
            <FaFacebook className='icon123' />
        </a>
        <a href='mailto:info@sjiscph.com' target="_blank" rel="noopener noreferrer">
            <BiLogoGmail className='icon123' />
        </a>
        <a href='tel:+10495313190'>
            <FaPhone className='icon123' />
        </a>
    </div>
    <p className='footer-home pb-2'>© Saint Jerome Integrated School of Cabuyao 2024. All Rights Reserved.</p>
</div>

        </div>
     );
}
 
export default Homepage;