import { Activity, MapPin, Calculator } from "lucide-react";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <Activity className="logo-icon-svg" />
          </div>
          <div className="logo-text">
            <h1>Geoffe Dashboard</h1>
            <p>Healthcare Facility Analysis & Cost Optimization</p>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-item">
            <MapPin size={20} />
            <span>Distance Analysis</span>
          </div>
          <div className="nav-item">
            <Calculator size={20} />
            <span>Cost Optimization</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
