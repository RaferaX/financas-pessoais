import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "Informe um email." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Resposta genérica, mesmo se o usuário não existir ou já estiver verificado
  if (!user || user.emailVerified) {
    return NextResponse.json({
      message: "Se este email precisar de verificação, um novo link foi enviado.",
    });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, verificationTokenExpiry },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/verificar-email?token=${verificationToken}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirme seu email — Finanças+",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Confirme seu email</h2>
        <p>Clique no link abaixo para confirmar seu email. Esse link expira em 24 horas.</p>
        <p><a href="${verifyUrl}" style="background:#E8B04B;color:#0A0D12;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Confirmar email</a></p>
      </div>
    `,
  });

  return NextResponse.json({
    message: "Se este email precisar de verificação, um novo link foi enviado.",
  });
}