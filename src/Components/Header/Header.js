import { Link } from "react-router-dom";
import "./Header.scss";

function Header() {
  return (
    <header className="Header">
      <nav>
        <ul>
          <li>
            <Link className="menu-item" id="Nav-Home" to="/">
              Home
            </Link>
          </li>
          <li>
            <Link className="menu-item" id="Nav-PlayFriend" to="/room">
              Play a Friend
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
