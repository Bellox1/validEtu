import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Settings, X, Calculator, Info } from 'lucide-react'; // Ajoutez l'icône Info

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/dashboard',
      name: 'Tableau de bord',
      icon: <LayoutDashboard size={20} />
    },
    {
      path: '/academic-years',
      name: 'Années académiques',
      icon: <GraduationCap size={20} />
    },
    {
      path: '/simulations',
      name: 'Simulations',
      icon: <Calculator size={20} />
    },
    {
      path: '/profile',
      name: 'Profil',
      icon: <Settings size={20} />
    },
    {
      path: '/details',  // Ajoutez le chemin vers la page "En savoir plus"
      name: 'En savoir plus',
      icon: <Info size={20} />  // Utilisez l'icône Info pour ce lien
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-blue-600">ValidEtu</h2>
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-gray-700"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive(item.path)
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => onClose()}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t text-xs text-gray-500">
            <p>© 2025 ValidEtu</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
