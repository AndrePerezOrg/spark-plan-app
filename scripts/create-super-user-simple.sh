#!/bin/bash

# Simple script to create a super user
# Usage: ./scripts/create-super-user-simple.sh <email> <password>

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ $# -ne 2 ]; then
    echo -e "${RED}Usage: ./scripts/create-super-user-simple.sh <email> <password>${NC}"
    exit 1
fi

EMAIL="$1"
PASSWORD="$2"
DEFAULT_ORG_ID="00000000-0000-0000-0000-000000000001"

echo -e "${BLUE}🚀 Creating super user: $EMAIL${NC}"

# Generate UUID for user
USER_ID=$(npx -y uuid)

echo -e "${BLUE}📝 Generated User ID: $USER_ID${NC}"

# Create auth user
echo -e "${BLUE}🔐 Creating auth user...${NC}"
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << EOF
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '$USER_ID',
  'authenticated',
  'authenticated',
  '$EMAIL',
  crypt('$PASSWORD', gen_salt('bf')),
  NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW()
);
EOF

echo -e "${GREEN}✅ Auth user created${NC}"

# Create user profile
echo -e "${BLUE}👤 Creating user profile...${NC}"
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << EOF
INSERT INTO public.user_profiles (id, display_name, role, is_active)
VALUES ('$USER_ID', '$(echo $EMAIL | cut -d@ -f1)', 'super_admin', true)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  updated_at = NOW();
EOF

echo -e "${GREEN}✅ User profile created${NC}"

# Link to organization
echo -e "${BLUE}🏢 Linking to organization...${NC}"
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << EOF
INSERT INTO public.user_organizations (user_id, organization_id, role)
VALUES ('$USER_ID', '$DEFAULT_ORG_ID', 'admin')
ON CONFLICT (user_id, organization_id) DO UPDATE SET
  role = EXCLUDED.role;
EOF

echo -e "${GREEN}✅ User linked to organization${NC}"

echo ""
echo -e "${GREEN}🎉 SUCCESS! Super user created:${NC}"
echo "📧 Email: $EMAIL"
echo "🔑 Password: $PASSWORD"
echo "🆔 User ID: $USER_ID"
echo "🔐 Role: super_admin"
echo ""
echo "🌐 Login at: http://localhost:8082"
echo "🔧 Supabase Studio: http://127.0.0.1:54323"