import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@company.com';
  const password = process.env.ADMIN_PASSWORD ?? 'AdminP@ssw0rd!';

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Admin user created: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
