import React, { useState } from 'react';
import { MOCK_LOANS } from '../constants';
import { LoanStatus } from '../types';
import { AlertCircle, CheckCircle, Clock, Search, Calendar } from 'lucide-react';

const Loans: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.ACTIVE: return 'bg-sky-50 text-sky-800 border-sky-200'; // Keeping slight blue but warmer context
      case LoanStatus.RETURNED: return 'bg-stone-100 text-stone-600 border-stone-200';
      case LoanStatus.OVERDUE: return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  const getStatusIcon = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.ACTIVE: return <Clock className="w-3.5 h-3.5 mr-1.5" />;
      case LoanStatus.RETURNED: return <CheckCircle className="w-3.5 h-3.5 mr-1.5" />;
      case LoanStatus.OVERDUE: return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />;
    }
  };

  const filteredLoans = MOCK_LOANS.filter(loan => 
    loan.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loan.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-950 mb-2">Registre des Emprunts</h1>
          <p className="text-stone-600 italic">Suivi des prêts et retours de la bibliothèque.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher un emprunteur ou un livre..." 
            className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 bg-[#fdfbf7] placeholder-stone-400 text-stone-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f5f5f4] border-b border-stone-300">
              <tr>
                <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider font-serif">Livre</th>
                <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider font-serif">Lecteur</th>
                <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider font-serif">Dates</th>
                <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider font-serif">État</th>
                <th className="p-5 text-xs font-bold text-stone-500 uppercase tracking-wider text-right font-serif">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-[#fffcf5]">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-[#fefce8] transition-colors">
                  <td className="p-5">
                    <span className="font-bold font-serif text-stone-900 block text-lg">{loan.bookTitle}</span>
                    <span className="text-xs text-stone-400 font-mono">REF: {loan.bookId}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-serif font-bold text-xs mr-3 border border-amber-200">
                            {loan.userName.charAt(0)}
                        </div>
                        <span className="text-stone-700 font-medium">{loan.userName}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-stone-600">
                            <Calendar className="w-3 h-3 mr-2 text-stone-400" />
                            <span className="text-stone-500 text-xs uppercase mr-1">Du</span> {loan.borrowDate}
                        </div>
                        <div className={`flex items-center text-sm font-medium ${loan.status === LoanStatus.OVERDUE ? 'text-red-700' : 'text-stone-500'}`}>
                             <span className="w-5 mr-2 text-stone-400 text-xs uppercase text-right">Au</span>
                             {loan.dueDate}
                        </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold border uppercase tracking-wide ${getStatusColor(loan.status)}`}>
                      {getStatusIcon(loan.status)}
                      {loan.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {loan.status !== LoanStatus.RETURNED ? (
                      <button className="text-sm font-bold font-serif text-amber-50 bg-amber-800 hover:bg-amber-900 px-4 py-2 rounded-sm transition-all shadow-sm hover:shadow-md">
                        Marquer Retourné
                      </button>
                    ) : (
                        <span className="text-sm text-stone-400 italic font-serif">Archivé</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLoans.length === 0 && (
            <div className="p-8 text-center text-stone-500 italic">
                Aucune fiche d'emprunt ne correspond à votre recherche.
            </div>
        )}
      </div>
    </div>
  );
};

export default Loans;