#!/bin/bash

# Create remaining 5 modules quickly

MODULES=(
  "subscriptions"
  "payments"
  "content"
  "marketplace"
  "analytics"
)

for MODULE in "${MODULES[@]}"; do
  echo "Creating $MODULE module..."

  mkdir -p "src/modules/$MODULE"

  # Module file
  cat > "src/modules/$MODULE/${MODULE}.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ${ServiceName}Service } from './${module}.service';
import { ${ControllerName}Controller } from './${module}.controller';

@Module({
  imports: [PrismaModule],
  providers: [${ServiceName}Service],
  controllers: [${ControllerName}Controller],
  exports: [${ServiceName}Service],
})
export class ${ModuleName}Module {}
EOF
  sed -i "s/\${module}/$MODULE/g" "src/modules/$MODULE/${MODULE}.module.ts"
  sed -i "s/\${ServiceName}/$(echo $MODULE | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')Service/g" "src/modules/$MODULE/${MODULE}.module.ts"
  sed -i "s/\${ControllerName}/$(echo $MODULE | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')Controller/g" "src/modules/$MODULE/${MODULE}.module.ts"
  sed -i "s/\${ModuleName}/$(echo $MODULE | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')/g" "src/modules/$MODULE/${MODULE}.module.ts"

  # Service file
  cat > "src/modules/$MODULE/${MODULE}.service.ts" << 'EOF'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ${ServiceName} {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return { message: '${Module} module ready' };
  }
}
EOF
  sed -i "s/\${ServiceName}/$(echo $MODULE | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')Service/g" "src/modules/$MODULE/${MODULE}.service.ts"
  sed -i "s/\${Module}/$(echo $MODULE | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')/g" "src/modules/$MODULE/${MODULE}.service.ts"

  # Controller file
  cat > "src/modules/$MODULE/${MODULE}.controller.ts" << 'EOF'
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${ServiceName} } from './${module}.service';

@ApiTags('${ApiTag}')
@Controller('${module}')
export class ${ControllerName} {
  constructor(private readonly service: ${ServiceName}) {}

  @Get()
  async getAll() {
    return this.service.getAll();
  }
}
EOF
  sed -i "s/\${ServiceName}/$(echo $MODULE | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')Service/g" "src/modules/$MODULE/${MODULE}.controller.ts"
  sed -i "s/\${ControllerName}/$(echo $MODULE | sed 's/-//g' | sed 's/\b\(.\)/\u\1/g')Controller/g" "src/modules/$MODULE/${MODULE}.controller.ts"
  sed -i "s/\${ApiTag}/$(echo $MODULE | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')/g" "src/modules/$MODULE/${MODULE}.controller.ts"
  sed -i "s/\${module}/$MODULE/g" "src/modules/$MODULE/${MODULE}.controller.ts"

  echo "✓ $MODULE created"
done

echo ""
echo "✅ All 5 modules created!"
