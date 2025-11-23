import React, { useState } from 'react';
import { BookOpen, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    if (email && password) {
      onLogin();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-amber-900"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-amber-900"></div>
      <div className="absolute -left-20 top-20 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute -right-20 bottom-20 w-64 h-64 bg-stone-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <div className="mb-8 flex flex-col items-center z-10">
        <div className="bg-amber-900 p-4 rounded-full shadow-xl mb-6 border-4 border-amber-100">
          <BookOpen className="w-12 h-12 text-amber-50" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-amber-950 tracking-tight">BiblioTech</h1>
        <p className="text-amber-800/70 mt-2 font-serif italic text-lg">Portail de gestion documentaire</p>
      </div>

      <div className="bg-white p-10 rounded-sm shadow-2xl w-full max-w-md border-t-4 border-amber-800 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2 font-serif uppercase tracking-wide">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all bg-[#fdfbf7]"
                placeholder="bibliothecaire@bibliotech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2 font-serif uppercase tracking-wide">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all bg-[#fdfbf7]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-2">
              <a href="#" className="text-sm text-amber-700 hover:text-amber-900 font-medium hover:underline">Mot de passe oublié ?</a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-900 hover:bg-amber-800 text-amber-50 font-serif font-bold py-3.5 rounded-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 tracking-wide uppercase text-sm"
          >
            Accéder à la bibliothèque
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-stone-400 text-sm font-serif">
        © 2024 BiblioTech Systems. Savoir & Tradition.
      </p>
    </div>
  );
};

export default Login;