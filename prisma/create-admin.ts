// Membuat/menaikkan akun SUPER_ADMIN dari env. Jalankan: npm run db:create-admin
// Tidak menyentuh konten. Password tidak pernah di-hardcode.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Super Admin";
  if (!email || !password) {
    throw new Error("Set SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD di .env.local terlebih dahulu.");
  }
  if (password.length < 8) throw new Error("SEED_ADMIN_PASSWORD minimal 8 karakter.");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "SUPER_ADMIN", isActive: true },
    create: { email, name, passwordHash, role: "SUPER_ADMIN", isActive: true },
  });
  console.log(`Super Admin siap: ${email}`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
