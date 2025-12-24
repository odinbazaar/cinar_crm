import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Get these from: https://supabase.com/dashboard/project/slanoowprgrcksfqrgak
// Project Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://slanoowprgrcksfqrgak.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey) {
    console.warn('⚠️ VITE_SUPABASE_ANON_KEY is not set. Please add it to your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})

// Helper functions for authentication
export const auth = {
    // Sign in with email and password
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    },

    // Sign up with email and password
    signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        })
        return { data, error }
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    // Get current user
    getCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser()
        return { user, error }
    },

    // Get current session
    getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession()
        return { session, error }
    },

    // Listen to auth state changes
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return supabase.auth.onAuthStateChange(callback)
    }
}

// Helper functions for database operations
export const db = {
    // Generic select
    from: (table: string) => supabase.from(table),

    // Real-time subscriptions
    subscribe: (table: string, callback: (payload: any) => void) => {
        return supabase
            .channel(`${table}_changes`)
            .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
            .subscribe()
    }
}

export default supabase
