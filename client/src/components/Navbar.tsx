import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    isActive ? "bg-bp-raise text-chalk" : "text-chalk-dim hover:text-chalk"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bp/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-signal text-bp-deep">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-bold text-chalk">AI Site Builder</span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/projects" className={linkClass}>
            My Projects
          </NavLink>
          <NavLink to="/community" className={linkClass}>
            Community
          </NavLink>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="rounded-full bg-tint px-3.5 py-1.5 font-semibold text-signal">
                {user.credits} credits
              </span>
              <button onClick={handleLogout} className="btn-line">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium text-chalk-dim hover:text-chalk">
                Sign in
              </Link>
              <Link to="/register" className="btn-signal">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;