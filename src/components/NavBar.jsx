import { NavLink } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function NavBar() {

    return (
        <>
        <nav className="navbar">
            <NavLink to="/" className="nav-logo">
                Home
            </NavLink>
        </nav>
        </>
        )
    }
      
        