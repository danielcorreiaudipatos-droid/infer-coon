#!/bin/bash

# 🚀 ONCREATORS - Create All NestJS Modules Automatically
# Execute: bash CREATE-MODULES.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🚀 OnCreators - Creating All Modules                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BASE_DIR="src/modules"

# Function to create module files
create_module() {
    local module=$1
    local description=$2

    echo "📁 Creating $module module..."
    mkdir -p "$BASE_DIR/$module"

    # Module file
    cat > "$BASE_DIR/$module/${module}.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [],
  controllers: [],
  exports: [],
})
export class ${ModuleName}Module {}
EOF
    sed -i "s/\${ModuleName}/$(echo $module | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')/g" "$BASE_DIR/$module/${module}.module.ts"

    # Service file
    cat > "$BASE_DIR/$module/${module}.service.ts" << 'EOF'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ${ServiceName} {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement service methods
}
EOF
    sed -i "s/\${ServiceName}/$(echo $module | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')Service/g" "$BASE_DIR/$module/${module}.service.ts"

    # Controller file
    cat > "$BASE_DIR/$module/${module}.controller.ts" << 'EOF'
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${ServiceName} } from './${module}.service';

@ApiTags('${ApiTag}')
@Controller('${module}')
export class ${ControllerName} {
  constructor(private readonly service: ${ServiceName}) {}

  // TODO: Implement endpoints
}
EOF
    sed -i "s/\${ServiceName}/$(echo $module | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')Service/g" "$BASE_DIR/$module/${module}.controller.ts"
    sed -i "s/\${ControllerName}/$(echo $module | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')Controller/g" "$BASE_DIR/$module/${module}.controller.ts"
    sed -i "s/\${ApiTag}/$(echo $description)/g" "$BASE_DIR/$module/${module}.controller.ts"

    # DTOs directory
    mkdir -p "$BASE_DIR/$module/dto"

    echo "  ✅ $module created"
}

# Create all modules
create_module "auth" "Authentication"
create_module "creators" "Creators"
create_module "subscriptions" "Subscriptions"
create_module "payments" "Payments"
create_module "content" "Content"
create_module "marketplace" "Marketplace"
create_module "analytics" "Analytics"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ ALL MODULES CREATED!                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run dev"
echo ""
