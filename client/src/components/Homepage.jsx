import { useNavigate } from "react-router-dom";
import BannerImage from "../Assets/home.jpg";
import '../styles/Homepage.css';

const Homepage = () => {
    
    const navigate = useNavigate()

    return ( 
        <div>
            <header>
                
            </header>
                <div className="home" style={{ backgroundImage: `url(${BannerImage})` }}>
                    <div className="headerContainer">
                    <button onClick={() => navigate('/userlogin')} className="order-now">ORDER NOW</button>
                </div>
            </div>
        </div>
     );
}
 
export default Homepage;