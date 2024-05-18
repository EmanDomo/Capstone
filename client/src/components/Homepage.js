import { useNavigate } from "react-router-dom";
import { IoFastFood } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import BannerImage from "../Assets/home.jpg";
import '../styles/Homepage.css';
import Header from "./Header";

const Homepage = () => {
    
    const navigate = useNavigate()

    return ( 
        <div>
            <header>
                <Header />
            </header>
                <div className="home" style={{ backgroundImage: `url(${BannerImage})` }}>
                    <div className="headerContainer">
                    <button onClick={() => navigate('/Menu')} className="order-now">ORDER NOW</button>
                </div>
            </div>
        </div>
     );
}
 
export default Homepage;