import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: "Token ausente." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });

  if (
    !user ||
    !user.verificationTokenExpiry ||
    user.verificationTokenExpiry < new Date()
  ) {
    return NextResponse.json(
      { error: "Link inválido ou expirado. Solicite um novo email de verificação." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return NextResponse.json({ success: true });
}