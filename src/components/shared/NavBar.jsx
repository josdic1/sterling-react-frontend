import { NavLink } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function NavBar() {
    const { loggedIn, logout, user } = useAuth();

    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-logo">
                
            </NavLink>

            <div className="nav-links">
                {/* Only show these if the user is logged in */}
                {loggedIn ? (
                    <>
                      Hello! {user.name}
                      <NavLink to="/">HOME</NavLink>
                        <NavLink to="/reservations/new">ADD Reservation</NavLink>
                         <NavLink to="/members/new">ADD Member</NavLink>
                        <button onClick={logout} className="logout-btn">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login">Login</NavLink>
                    </>
                )}
            </div>
        </nav>
    );
}