import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: "Token ausente." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { pendingEmailToken: token } });

  if (
    !user ||
    !user.pendingEmailTokenExpiry ||
    user.pendingEmailTokenExpiry < new Date() ||
    !user.pendingEmail
  ) {
    return NextResponse.json(
      { error: "Link inválido ou expirado. Solicite a troca de email novamente." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.pendingEmail,
      pendingEmail: null,
      pendingEmailToken: null,
      pendingEmailTokenExpiry: null,
    },
  });

  return NextResponse.json({ success: true });
}