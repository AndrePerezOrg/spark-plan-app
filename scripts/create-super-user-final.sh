#!/bin/bash

# Final script to create a super user using Supabase Auth Admin API
# Usage: ./scripts/create-super-user-final.sh <email> <password>

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
    print_error "Usage: ./scripts/create-super-user-final.sh <email> <password>"
    echo "📝 Example: ./scripts/create-super-user-final.sh admin@bix.com mypassword123"
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

# Check if Supabase is running
print_step "Checking Supabase status..."
if ! npx supabase status > /dev/null 2>&1; then
    print_error "Supabase local is not running. Please run 'npx supabase start' first."
    exit 1
fi
print_success "Supabase local is running"

# Create user using JavaScript script
print_step "Creating super user: $EMAIL"
node scripts/create-user.cjs "$EMAIL" "$PASSWORD"

echo ""
print_success "SUCCESS! Super user created successfully!"
echo ""
print_info "Login Details:"
echo "   📧 Email: $EMAIL"
echo "   🔑 Password: $PASSWORD"
echo "   🔐 Role: super_admin"
echo ""
print_info "Access URLs:"
echo "   🌐 App: http://localhost:8082"
echo "   🔧 Supabase Studio: http://127.0.0.1:54323"
echo ""
echo -e "${GREEN}🎉 You can now login to the application!${NC}"