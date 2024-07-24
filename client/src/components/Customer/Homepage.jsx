import { useNavigate } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import Logo from "../../Assets/logo.png";
import '../../styles/Homepage.css';

const Homepage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="banner">
                <FaRegUserCircle id="home-admin" onClick={() => navigate('/loginform')}/>
                <img src={Logo} className="logo1" alt="logo" />
                <h1>Saint Jerome Integrated School of Cabuyao Canteen Ordering System</h1>
                <button onClick={() => navigate('/userlogin')}  id="btn">ORDER NOW!</button>
            </div>
        </div>
    );
}

export default Homepage;
