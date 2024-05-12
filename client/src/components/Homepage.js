import { useNavigate } from "react-router-dom";
import { IoFastFood } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import '../styles/Homepage.css';

const Homepage = () => {
    
    const navigate = useNavigate()

    return ( 
        <div className="home-body">
            <h1>ORDERING SYSTEM</h1>
                <div className="btnHome">
                    <button onClick={() => navigate('Menu')} className="user"><IoFastFood/></button>
                    <button onClick={() => navigate('LoginForm')} className="admin"><FaRegUser/></button>
                </div>
        </div>
     );
}
 
export default Homepage;