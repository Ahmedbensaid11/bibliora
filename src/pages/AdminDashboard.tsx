import React from 'react';
import { 
  Users, BookOpen, History, TrendingUp, 
  Download, FileText, MoreVertical, Shield, Ban
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { DASHBOARD_STATS, GENRE_DISTRIBUTION } from '../constants';

// Données simulées pour le tableau des utilisateurs (puisqu'on ne les a pas dans constants)
const USERS_LIST = [
  { id: 1, name: 'Cheb Mami', email: 'mami@biblio.com', role: 'ADMIN', status: 'Active', joinDate: '2023-01-15' },
  { id: 2, name: 'Khaled King', email: 'khaled@rai.com', role: 'READER', status: 'Active', joinDate: '2023-02-20' },
  { id: 3, name: 'Faudel Little', email: 'faudel@love.com', role: 'READER', status: 'Blocked', joinDate: '2023-03-10' },
  { id: 4, name: 'Rachid Taha', email: 'rock@casbah.com', role: 'READER', status: 'Active', joinDate: '2023-04-05' },
  { id: 5, name: 'Billie H', email: 'holiday@jazz.com', role: 'READER', status: 'Active', joinDate: '2023-05-12' },
];

const COLORS = ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b']; // Dégradé d'Ambre

const AdminDashboard: React.FC = () => {

  const handleExport = (format: string) => {
    alert(`Export ${format} généré avec succès ! (Simulation)`);
  };

  return (
    <div className="space-y-8">
      {/* --- EN-TÊTE AVEC BOUTONS EXPORT --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-950">Tableau de Bord Administratif</h1>
          <p className="text-stone-600 italic">Vue d'ensemble des statistiques et gestion des membres.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleExport('PDF')}
            className="flex items-center px-4 py-2 bg-rose-900 text-white rounded-sm hover:bg-rose-800 transition-colors shadow-sm text-sm font-bold"
          >
            <FileText className="w-4 h-4 mr-2" />
            Rapport PDF
          </button>
          <button 
            onClick={() => handleExport('Excel')}
            className="flex items-center px-4 py-2 bg-emerald-800 text-white rounded-sm hover:bg-emerald-700 transition-colors shadow-sm text-sm font-bold"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* --- CARTES STATISTIQUES (KPI) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Livres" value="1,240" change="+12%" />
        <StatCard icon={Users} label="Membres Actifs" value="843" change="+5%" />
        <StatCard icon={History} label="Emprunts en cours" value="125" change="-2%" />
        <StatCard icon={TrendingUp} label="Taux de Retour" value="94%" change="+1%" />
      </div>

      {/* --- GRAPHIQUES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Graphique en Barres : Activité Mensuelle */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-200">
          <h3 className="font-serif font-bold text-lg text-amber-900 mb-6 border-l-4 border-amber-600 pl-3">
            Activité des Emprunts (6 derniers mois)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DASHBOARD_STATS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fffcf5', borderColor: '#d6d3d1', borderRadius: '4px'}}
                  itemStyle={{color: '#78350f', fontWeight: 'bold'}}
                />
                <Bar dataKey="loans" name="Emprunts" fill="#92400e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returns" name="Retours" fill="#d6d3d1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique Camembert : Répartition Genres */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-200">
          <h3 className="font-serif font-bold text-lg text-amber-900 mb-6 border-l-4 border-amber-600 pl-3">
            Répartition par Genre
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={GENRE_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {GENRE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- TABLEAU GESTION UTILISATEURS --- */}
      <div className="bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-[#fffcf5]">
          <h3 className="font-serif font-bold text-lg text-amber-900">Gestion des Utilisateurs</h3>
          <div className="text-xs text-stone-500 italic">Dernière mise à jour : Aujourd'hui</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-600 font-serif uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4 font-bold">Utilisateur</th>
                <th className="p-4 font-bold">Rôle</th>
                <th className="p-4 font-bold">Date d'inscription</th>
                <th className="p-4 font-bold">Statut</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {USERS_LIST.map((user) => (
                <tr key={user.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-4 font-medium text-stone-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-serif font-bold text-stone-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs text-stone-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      user.role === 'ADMIN' 
                      ? 'bg-amber-100 text-amber-800 border-amber-200' 
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-stone-600 font-mono text-xs">{user.joinDate}</td>
                  <td className="p-4">
                    {user.status === 'Active' ? (
                      <span className="inline-flex items-center text-emerald-700 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                        Bloqué
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-stone-400 hover:text-amber-700 p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Petit composant utilitaire pour les cartes du haut
const StatCard = ({ icon: Icon, label, value, change }: any) => (
  <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-200 hover:border-amber-300 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-stone-500 text-xs uppercase tracking-widest font-medium mb-1">{label}</p>
        <h4 className="text-2xl font-serif font-bold text-stone-900">{value}</h4>
      </div>
      <div className="p-2 bg-amber-50 rounded-lg">
        <Icon className="w-5 h-5 text-amber-700" />
      </div>
    </div>
    <div className="mt-2 text-xs">
      <span className={change.includes('+') ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
        {change}
      </span>
      <span className="text-stone-400 ml-1">vs mois dernier</span>
    </div>
  </div>
);

export default AdminDashboard;