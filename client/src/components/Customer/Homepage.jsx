import { useNavigate } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import Logo from "../../Assets/logo.png";
import '../../styles/Homepage.css';

const Homepage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="banner">
                <div className="admin-icons">
                    <FaRegUserCircle className="home-admin" onClick={() => navigate('/loginform')}/>
                    <RiAdminLine className="home-admin" onClick={() => navigate('/superadmin')}/>
                </div>
                <img src={Logo} className="logo1" alt="logo" />
                <h1>Saint Jerome Integrated School of Cabuyao Canteen Ordering System</h1>
                <button onClick={() => navigate('/userlogin')} id="btn">ORDER NOW!</button>
            </div>
        </div>
    );
}

export default Homepage;
