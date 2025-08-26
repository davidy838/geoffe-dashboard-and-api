import { Activity, MapPin, Calculator } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-xl p-3">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Geoffe Dashboard</h1>
              <p className="text-blue-100 text-sm">
                Healthcare Facility Analysis & Cost Optimization
              </p>
            </div>
          </div>

          <nav className="flex space-x-8">
            <div className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors">
              <MapPin size={20} />
              <span className="text-sm font-medium">Distance Analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors">
              <Calculator size={20} />
              <span className="text-sm font-medium">Cost Optimization</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
