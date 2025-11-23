import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  ChevronDown,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import type { User } from '../types'; 
import { MOCK_BOOKS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBooksDropdownOpen, setIsBooksDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract unique genres for the dropdown
  const genres = Array.from(new Set(MOCK_BOOKS.map(b => b.genre))).sort();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBooksDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGenreClick = (genre: string) => {
    setIsBooksDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/catalog?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans">
      {/* Navbar Traditionnelle - Style Bois/Marron */}
      <nav className="bg-amber-900 text-amber-50 shadow-md border-b border-amber-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo et Marque */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                <div className="bg-amber-50 p-2 rounded-full border-2 border-amber-200/30 shadow-inner">
                  <BookOpen className="h-6 w-6 text-amber-900" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-serif font-bold text-amber-50 tracking-wide group-hover:text-amber-200 transition-colors">BiblioTech</span>
                  <span className="text-[10px] uppercase tracking-widest text-amber-300/80">Savoir & Tradition</span>
                </div>
              </Link>
              
              {/* Desktop Menu: Accueil | Livres | À propos | Contact */}
              <div className="hidden md:ml-12 md:flex md:items-center md:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/' ? 'text-amber-100 border-b-2 border-amber-400' : 'text-amber-300/90 hover:text-amber-100'
                  }`}
                >
                  Accueil
                </Link>

                {/* Dropdown Livres */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsBooksDropdownOpen(!isBooksDropdownOpen)}
                    onMouseEnter={() => setIsBooksDropdownOpen(true)}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 group ${
                      location.pathname === '/catalog' ? 'text-amber-100' : 'text-amber-300/90 hover:text-amber-100'
                    }`}
                  >
                    <span>Livres</span>
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isBooksDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isBooksDropdownOpen && (
                    <div 
                      className="absolute left-0 mt-2 w-56 rounded-sm shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      onMouseLeave={() => setIsBooksDropdownOpen(false)}
                    >
                      <div className="py-1 bg-[#fffcf5] border border-amber-100 rounded-sm">
                        <div className="px-4 py-2 text-xs font-bold text-amber-800/50 uppercase tracking-wider border-b border-amber-100/50 mb-1">
                          Genres
                        </div>
                        <button
                          onClick={() => handleGenreClick('All')}
                          className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-serif"
                        >
                          Tous les livres
                        </button>
                        {genres.map((genre) => (
                          <button
                            key={genre}
                            onClick={() => handleGenreClick(genre)}
                            className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900 font-serif"
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="#"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-amber-300/90 hover:text-amber-100 transition-colors"
                >
                  À propos
                </Link>

                <Link
                  to="#"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-amber-300/90 hover:text-amber-100 transition-colors"
                >
                  Contact
                </Link>
                <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center px-3 py-1 ml-4 text-sm font-bold text-amber-50 bg-amber-900 rounded-sm hover:bg-amber-800 transition-colors shadow-sm"
                >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                 Dashboard
                </Link>

                {/* --- BOUTON CRUD AJOUTÉ --- */}
                <Link
                    to="/admin/books"
                    className="inline-flex items-center px-3 py-1 ml-4 text-sm font-bold text-amber-900 bg-amber-100 rounded-sm hover:bg-white transition-colors shadow-sm border border-amber-200"
                    >
                <Settings className="w-4 h-4 mr-2" />
                Gestion (Admin)
                </Link>
              </div>
            </div>

            {/* User Menu (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-amber-950/30 border border-amber-700/50 backdrop-blur-sm group relative cursor-pointer">
                <img
                  className="h-9 w-9 rounded-full object-cover border-2 border-amber-700"
                  src={user.avatarUrl}
                  alt={user.name}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-serif font-bold text-amber-50 leading-none">{user.name}</span>
                  <span className="text-xs text-amber-300/70 leading-none mt-1">{user.role}</span>
                </div>

                {/* User Dropdown content could go here, simplified for now */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-stone-200">
                    <div className="py-1">
                        <Link to="/loans" className="block px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900">
                            Mes Emprunts
                        </Link>
                        <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Déconnexion
                        </button>
                    </div>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-amber-200 hover:text-white hover:bg-amber-800 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-amber-900 border-t border-amber-800">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  location.pathname === '/'
                    ? 'bg-amber-800 border-amber-400 text-amber-50'
                    : 'border-transparent text-amber-300 hover:bg-amber-800 hover:text-white'
                }`}
              >
                Accueil
              </Link>
              
              {/* Mobile Books Dropdown */}
              <div className="space-y-1">
                <div className="pl-3 pr-4 py-2 text-base font-medium text-amber-300 border-l-4 border-transparent">
                    Livres
                </div>
                <div className="pl-6 space-y-1">
                    <button onClick={() => handleGenreClick('All')} className="block py-2 text-sm text-amber-400 hover:text-white w-full text-left">
                        Tous les livres
                    </button>
                    {genres.map(g => (
                        <button key={g} onClick={() => handleGenreClick(g)} className="block py-2 text-sm text-amber-400 hover:text-white w-full text-left">
                            {g}
                        </button>
                    ))}
                </div>
              </div>

              <Link to="#" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-amber-300 hover:bg-amber-800 hover:text-white">
                 À propos
              </Link>
              <Link to="#" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-amber-300 hover:bg-amber-800 hover:text-white">
                 Contact
              </Link>
              
              <Link 
                to="/loans" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  location.pathname === '/loans'
                    ? 'bg-amber-800 border-amber-400 text-amber-50'
                    : 'border-transparent text-amber-300 hover:bg-amber-800 hover:text-white'
                }`}
              >
                Mes Emprunts
              </Link>
            </div>
            
            <div className="pt-4 pb-4 border-t border-amber-800 bg-amber-950/30">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full border-2 border-amber-700" src={user.avatarUrl} alt="" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-amber-50">{user.name}</div>
                  <div className="text-sm font-medium text-amber-400">{user.email}</div>
                </div>
                <button 
                  onClick={onLogout}
                  className="ml-auto flex-shrink-0 p-1 text-amber-400 hover:text-red-400"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content - Fond couleur papier */}
      <main className="flex-grow bg-[#fdfbf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-amber-900/10 mt-auto">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6 md:order-2">
              <a href="#" className="text-stone-500 hover:text-amber-700 transition-colors font-serif italic">Confidentialité</a>
              <a href="#" className="text-stone-500 hover:text-amber-700 transition-colors font-serif italic">Conditions</a>
              <a href="#" className="text-stone-500 hover:text-amber-700 transition-colors font-serif italic">Aide</a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                 <BookOpen className="h-4 w-4 text-amber-700" />
                 <span className="text-amber-900 font-serif font-bold">BiblioTech</span>
              </div>
              <p className="text-center md:text-left text-sm text-stone-500">
                &copy; 2024 BiblioTech Systems. Savoir & Tradition.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;