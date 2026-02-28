import { LucideIcon } from 'lucide-react';

export interface User {
  name: string;
  role: string;
  avatar: string;
}

export interface Job {
  id: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Scheduled' | 'Pending Approval' | 'Removed';
  tip?: number;
  removedAt?: string;
}

export interface Stats {
  weeklyHours: string;
  grossRevenue: number;
  processingFees: number;
  tips: number;
}

export type ViewState = 'profile' | 'pos' | 'pending' | 'trash' | 'analytics';
