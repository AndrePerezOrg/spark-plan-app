#!/usr/bin/env node

/**
 * Script to create a super user linked to the default organization
 * Usage: node scripts/create-super-user.js <email> <password>
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Default organization ID (from migrations)
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

async function createSuperUser(email, password) {
  console.log('🚀 Creating super user for BIX Kanban Ideas...')

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Create user in auth.users
    console.log(`📧 Creating auth user: ${email}`)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for local development
    })

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`)
    }

    const userId = authData.user.id
    console.log(`✅ Auth user created with ID: ${userId}`)

    // 2. Create user profile with super_admin role
    console.log('👤 Creating user profile...')
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        display_name: email.split('@')[0], // Use email prefix as display name
        role: 'super_admin',
        is_active: true
      })

    if (profileError) {
      throw new Error(`Profile error: ${profileError.message}`)
    }

    console.log('✅ User profile created with super_admin role')

    // 3. Link user to default organization
    console.log('🏢 Linking user to default organization...')
    const { error: membershipError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: userId,
        organization_id: DEFAULT_ORG_ID,
        role: 'admin',
        is_active: true
      })

    if (membershipError) {
      throw new Error(`Membership error: ${membershipError.message}`)
    }

    console.log('✅ User linked to BIX Innovation Hub organization')

    // 4. Verify setup
    console.log('🔍 Verifying setup...')
    const { data: verification, error: verifyError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_organizations!inner(
          organization_id,
          role,
          organizations(name, slug)
        )
      `)
      .eq('id', userId)
      .single()

    if (verifyError) {
      throw new Error(`Verification error: ${verifyError.message}`)
    }

    console.log('\n🎉 SUCCESS! Super user created successfully!')
    console.log('📋 User Details:')
    console.log(`   📧 Email: ${email}`)
    console.log(`   🆔 ID: ${userId}`)
    console.log(`   👤 Display Name: ${verification.display_name}`)
    console.log(`   🔐 Role: ${verification.role}`)
    console.log(`   🏢 Organization: ${verification.user_organizations[0].organizations.name}`)
    console.log(`   🔗 Org Role: ${verification.user_organizations[0].role}`)

    console.log('\n🌐 Access URLs:')
    console.log(`   App: http://localhost:8082`)
    console.log(`   Supabase Studio: http://127.0.0.1:54323`)

    console.log('\n🔑 Login Credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)

  } catch (error) {
    console.error('❌ Error creating super user:', error.message)
    process.exit(1)
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2)

  if (args.length !== 2) {
    console.error('❌ Usage: node scripts/create-super-user.js <email> <password>')
    console.error('📝 Example: node scripts/create-super-user.js admin@bix.com mypassword123')
    process.exit(1)
  }

  const [email, password] = args

  // Basic validation
  if (!email.includes('@')) {
    console.error('❌ Invalid email format')
    process.exit(1)
  }

  if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters long')
    process.exit(1)
  }

  createSuperUser(email, password)
}

main()