import { supabase } from './supabase'
import type { Database } from '@/types/database'

export const api = {
  // Auth functions
  auth: {
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { data: { user: data.user }, error: null }
    },

    signOut: async () => {
      return await supabase.auth.signOut()
    },

    getSession: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return { data: { user: session?.user }, error: null }
    }
  },

  // Agency functions
  agencies: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    },

    getByState: async (state: string) => {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('state', state)
        .order('name')
      
      if (error) throw error
      return data
    }
  },

  // Complaint functions
  complaints: {
    create: async (complaint: Database['public']['Tables']['complaints']['Insert']) => {
      const { data, error } = await supabase
        .from('complaints')
        .insert(complaint)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    getAll: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          users (
            full_name,
            email
          ),
          agencies (
            name,
            state
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    getByUser: async (userId: string) => {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          agencies (
            name,
            state
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    update: async (id: number, updates: Database['public']['Tables']['complaints']['Update']) => {
      const { data, error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    delete: async (id: number) => {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  }
} 