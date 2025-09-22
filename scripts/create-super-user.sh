#!/bin/bash

# Script to create a super user linked to the default organization
# Usage: ./scripts/create-super-user.sh <email> <password>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default organization ID (from migrations)
DEFAULT_ORG_ID="00000000-0000-0000-0000-000000000001"

# Function to print colored output
print_step() {
    echo -e "${BLUE}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}📋 $1${NC}"
}

# Check arguments
if [ $# -ne 2 ]; then
    print_error "Usage: ./scripts/create-super-user.sh <email> <password>"
    echo "📝 Example: ./scripts/create-super-user.sh admin@bix.com mypassword123"
    exit 1
fi

EMAIL="$1"
PASSWORD="$2"

# Basic validation
if [[ ! "$EMAIL" =~ .*@.* ]]; then
    print_error "Invalid email format"
    exit 1
fi

if [ ${#PASSWORD} -lt 6 ]; then
    print_error "Password must be at least 6 characters long"
    exit 1
fi

print_step "Creating super user for BIX Kanban Ideas..."

# Check if Supabase is running
print_step "Checking Supabase status..."
if ! npx supabase status > /dev/null 2>&1; then
    print_error "Supabase local is not running. Please run 'npx supabase start' first."
    exit 1
fi
print_success "Supabase local is running"

# Create SQL file for user creation
print_step "Creating auth user: $EMAIL"

SQL_FILE="/tmp/create_user_$$.sql"

cat > "$SQL_FILE" << EOF
-- Create auth user
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    '$EMAIL',
    crypt('$PASSWORD', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id
),
user_profile AS (
  INSERT INTO public.user_profiles (id, display_name, role, is_active)
  SELECT id, '$(echo $EMAIL | cut -d@ -f1)', 'super_admin', true
  FROM new_user
  RETURNING id
),
user_org AS (
  INSERT INTO public.user_organizations (user_id, organization_id, role, is_active)
  SELECT id, '$DEFAULT_ORG_ID', 'admin', true
  FROM new_user
  RETURNING user_id
)
SELECT
  nu.id as user_id,
  '$(echo $EMAIL | cut -d@ -f1)' as display_name,
  'super_admin' as user_role,
  'BIX Innovation Hub' as org_name,
  'admin' as org_role
FROM new_user nu;
EOF

# Execute SQL and capture result
RESULT=$(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f "$SQL_FILE" -t 2>/dev/null | head -1)

# Clean up temp file
rm -f "$SQL_FILE"

if [ -z "$RESULT" ]; then
    print_error "Failed to create auth user"
    exit 1
fi

# Extract user ID from result
USER_ID=$(echo "$RESULT" | awk '{print $1}' | tr -d ' ')

print_success "Auth user created with ID: $USER_ID"
print_success "User profile created with super_admin role"
print_success "User linked to BIX Innovation Hub organization"

echo ""
print_success "SUCCESS! Super user created successfully!"
echo ""
print_info "User Details:"
echo "   📧 Email: $EMAIL"
echo "   🆔 ID: $USER_ID"
echo "   👤 Display Name: $(echo $EMAIL | cut -d@ -f1)"
echo "   🔐 Role: super_admin"
echo "   🏢 Organization: BIX Innovation Hub"
echo "   🔗 Org Role: admin"

echo ""
print_info "Access URLs:"
echo "   🌐 App: http://localhost:8082"
echo "   🔧 Supabase Studio: http://127.0.0.1:54323"

echo ""
print_info "Login Credentials:"
echo "   📧 Email: $EMAIL"
echo "   🔑 Password: $PASSWORD"

echo ""
echo -e "${GREEN}🎉 You can now login to the application!${NC}"