#!/bin/sh

# Run migrations and start server
echo "Running database migrations..."
npx medusa db:migrate

echo "Seeding database..."
# yarn seed || echo "Seeding failed, continuing..."
npx medusa exec ./src/scripts/seed.ts || echo "Seeding failed, continuing..."

echo "Index meilisearch"
npx  medusa exec ./src/scripts/index-products.ts || echo "index failed, continuing..."

echo "Creating admin user..."
npx medusa user -e admin@example.com -p supersecret -i admin || echo "Admin user creation failed or already exists"

echo "Starting Medusa development server..."
# yarn dev
npx medusa develop