import {Link} from 'react-router-dom';
import '../../App.css';

const MainNavigation = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="container justify-content-center">
                <ul className="navbar-nav">
                    <li className="nav-item"><Link to="/" className="nav-link">Dashboard</Link></li>
                    <li className="nav-item"><Link to="about" className="nav-link">About</Link></li>
                    <li className="nav-item"><a href="http://127.0.0.1:5500/wwwroot/index.html" className="nav-link">Docs</a></li>
                </ul>
            </div>
        </nav>
    )
}

export default MainNavigation;