export type Agency = {
  id: number;
  name: string;
  state: string;
  address?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  phone?: string;
  created_at: string;
  updated_at: string;
}

export type Complaint = {
  id: number;
  user_id: string;
  agency_id: number;
  account_number: string;
  type: 'Litige de Transaction' | 'Plainte de Service' | 'Problème de Compte' | 'Autre';
  status: 'En attente' | 'En cours' | 'Résolu';
  description: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export type ComplaintHistory = {
  id: number;
  complaint_id: number;
  changed_by: string;
  old_status: 'En attente' | 'En cours' | 'Résolu';
  new_status: 'En attente' | 'En cours' | 'Résolu';
  comment?: string;
  created_at: string;
} 