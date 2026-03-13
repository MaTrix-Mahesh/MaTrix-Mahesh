import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Home, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <Home className="logo-icon" />
                    <span>LuxeRent</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/properties" className="nav-link">Rent</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/contact" className="nav-link">Contact</Link>
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link 
                                to={`/${user.role}-dashboard`} 
                                className="nav-link dashboard-link"
                            >
                                <UserIcon size={18} />
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className="btn btn-outline btn-sm">
                                <LogOut size={16} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-text">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
