import { Link } from "react-router-dom";
import MainNavigation from "./MainNavigation";

const MainPageHeader = () => {
    return (
        <header className="header main-page-header py-5">
            <div className="container text-center">
                <Link to="/" className="header-title">Greenhouse System</Link>
                <MainNavigation></MainNavigation>
            </div>
        </header>
    )
}

export default MainPageHeader;