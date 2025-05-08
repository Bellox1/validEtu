import { useAuth } from '../../contexts/AuthContext';
import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={onMenuClick}
            className="text-gray-600 hover:text-blue-600 md:hidden"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-blue-600">ValidEtu</h1>
        </div>

        {currentUser && (
          <div className="flex items-center space-x-2">
            <div className="hidden md:block text-sm font-medium text-gray-700">
              {currentUser.prenom} {currentUser.nom}
            </div>
            <div className="relative">
              <div className="group">
                <button
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
                  aria-label="User menu"
                >
                  <span className="text-sm font-medium">
                    {currentUser.prenom.charAt(0)}{currentUser.nom.charAt(0)}
                  </span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-3" />
                      Profil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-3" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;