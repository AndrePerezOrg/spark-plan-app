import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔧 AuthContext: useEffect triggered')

    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Auth loading timeout - forcing loading to false')
      setLoading(false)
    }, 5000) // 5 seconds timeout (reduced for faster debugging)

    // Get initial session
    console.log('🔍 AuthContext: Getting initial session...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('✅ AuthContext: Session retrieved:', session ? 'User found' : 'No user')
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('👤 AuthContext: User found, loading profile for:', session.user.id)
        loadProfile(session.user.id)
      } else {
        console.log('🚫 AuthContext: No user, setting loading to false')
        setLoading(false)
      }
      clearTimeout(loadingTimeout)
    }).catch((error) => {
      console.error('❌ AuthContext: Error getting session:', error)
      setLoading(false)
      clearTimeout(loadingTimeout)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      console.log('📋 loadProfile: Starting profile load for user:', userId)

      // Add a timeout to the query to prevent infinite hanging
      const queryTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 3 seconds')), 3000)
      })

      const queryPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('🔍 loadProfile: Executing query with timeout...')
      const startTime = Date.now()

      const { data, error } = await Promise.race([queryPromise, queryTimeout]) as any

      const endTime = Date.now()
      console.log(`⏱️ loadProfile: Query completed in ${endTime - startTime}ms`)

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        console.log('🆕 loadProfile: Profile not found, creating new profile')
        await createProfile(userId)
      } else if (error) {
        console.error('❌ loadProfile: Profile query error:', error)
        console.error('❌ loadProfile: Error details:', { code: error.code, message: error.message, details: error.details })
        // Even if there's an error, we should still allow the user to continue
        setProfile(null)
      } else {
        console.log('✅ loadProfile: Profile loaded successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('💥 loadProfile: Exception caught:', error)
      if (error.message === 'Query timeout after 3 seconds') {
        console.error('⏰ loadProfile: Database query timed out - possible RLS or connectivity issue')
      }
      // Ensure we don't get stuck in loading state
      setProfile(null)
    } finally {
      console.log('🏁 loadProfile: Setting loading to false')
      setLoading(false)
    }
  }

  const createProfile = async (userId: string) => {
    try {
      console.log('🆕 createProfile: Creating profile for user:', userId)

      const profileData = {
        id: userId,
        display_name: user?.email?.split('@')[0] || 'Usuário',
      }
      console.log('🆕 createProfile: Profile data:', profileData)

      const startTime = Date.now()
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      const endTime = Date.now()
      console.log(`⏱️ createProfile: Insert took ${endTime - startTime}ms`)

      if (error) {
        console.error('❌ createProfile: Error creating profile:', error)
        console.error('❌ createProfile: Error details:', { code: error.code, message: error.message, details: error.details })
        // Set profile to null so user can continue, even if profile creation failed
        setProfile(null)
      } else {
        console.log('✅ createProfile: Profile created successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('💥 createProfile: Exception caught:', error)
      setProfile(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    setProfile(data)
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}