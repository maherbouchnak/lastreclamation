export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export type Agency = {
  id: number;
  name: string;
  state: string;
  created_at: string;
}

export type Complaint = {
  id: number;
  user_id: string;
  agency_id: number;
  account_number: string;
  type: string;
  status: 'En attente' | 'En cours' | 'Résolu';
  description: string;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      agencies: {
        Row: Agency;
        Insert: Omit<Agency, 'id' | 'created_at'>;
        Update: Partial<Omit<Agency, 'id' | 'created_at'>>;
      };
      complaints: {
        Row: Complaint;
        Insert: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Complaint, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};

// Add this type for auth responses
export type AuthResponse = {
  data: {
    user: {
      id: string;
      email: string;
    } | null;
  };
  error: null | Error;
}

// Update the Complaint type to ensure agency_id is required
export type Complaint = {
  id: number;
  user_id: string;
  agency_id: number;
  account_number: string;
  type: string;
  status: 'En attente' | 'En cours' | 'Résolu';
  description: string;
  created_at: string;
  updated_at: string;
} 