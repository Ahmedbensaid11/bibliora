
import type { LucideIcon } from 'lucide-react';
// Remplacement de l'enum Role par un objet constant
export const Role = {
  ADMIN: 'ADMIN',
  READER: 'READER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: string;
  name: string;
  email: string;
  // Note: role est maintenant compatible avec notre constante ci-dessus
  role: Role; 
  avatarUrl?: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  genre: string;
  summary: string;
  coverUrl: string;
  availableCopies: number;
  totalCopies: number;
}

// Remplacement de l'enum LoanStatus par un objet constant
export const LoanStatus = {
  ACTIVE: 'En cours',
  RETURNED: 'Retourné',
  OVERDUE: 'En retard',
} as const;

export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus];

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  bookTitle: string;
  userName: string;
}

export interface StatMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}
