#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Get arguments
const [email, password] = process.argv.slice(2)

if (!email || !password) {
  console.error('❌ Usage: node create-user.js <email> <password>')
  process.exit(1)
}

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

async function createSuperUser() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Create user with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) throw authError

    const userId = authData.user.id
    console.log(`✅ User created: ${userId}`)

    // 2. Create profile (upsert)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        display_name: email.split('@')[0],
        role: 'super_admin',
        is_active: true,
        updated_at: new Date().toISOString()
      })

    if (profileError) throw profileError
    console.log('✅ Profile created/updated')

    // 3. Link to organization (upsert)
    const { error: orgError } = await supabase
      .from('user_organizations')
      .upsert({
        user_id: userId,
        organization_id: DEFAULT_ORG_ID,
        role: 'admin'
      }, {
        onConflict: 'user_id,organization_id'
      })

    if (orgError) throw orgError
    console.log('✅ Linked to organization')

    console.log(`🎉 SUCCESS: ${email}`)
    console.log(`🆔 User ID: ${userId}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createSuperUser()