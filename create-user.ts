import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "Adri@2026!SecurePass";
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email: "adriano@compostoweb.com.br" },
    update: {},
    create: {
      email: "adriano@compostoweb.com.br",
      password: hashedPassword,
      name: "Adriano",
    },
  });

  console.log("✅ Usuário criado com sucesso!");
  console.log("📧 Email: adriano@compostoweb.com.br");
  console.log("🔑 Senha: " + password);
  console.log("👤 Nome: Adriano");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
