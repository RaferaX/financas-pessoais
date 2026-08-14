import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Informe um email." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        message: "Se este email existir, você receberá um link de recuperação.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${resetToken}`;

    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Redefinir sua senha — Finanças+",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Redefinir senha</h2>
          <p>Recebemos uma solicitação para redefinir sua senha no Finanças+.</p>
          <p>Clique no link abaixo para criar uma nova senha. Esse link expira em 1 hora.</p>
          <p><a href="${resetUrl}" style="background:#E8B04B;color:#0A0D12;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Redefinir senha</a></p>
          <p>Se você não solicitou isso, pode ignorar este email.</p>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error("Erro do Resend:", emailResult.error);
      return NextResponse.json(
        { error: "Não foi possível enviar o email. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Se este email existir, você receberá um link de recuperação.",
    });
  } catch (error) {
    console.error("Erro em /api/forgot-password:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar solicitação." },
      { status: 500 }
    );
  }
}