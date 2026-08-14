import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, currentPassword, newPassword } = body;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const dataToUpdate: { name?: string; password?: string } = {};
  let emailChangeRequested = false;

  if (name !== undefined) {
    if (!name.trim()) {
      return NextResponse.json({ error: "Nome não pode ficar vazio" }, { status: 400 });
    }
    dataToUpdate.name = name.trim();
  }

  if (email !== undefined && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Este email já está em uso" }, { status: 400 });
    }

    const pendingEmailToken = crypto.randomBytes(32).toString("hex");
    const pendingEmailTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { pendingEmail: email, pendingEmailToken, pendingEmailTokenExpiry },
    });

    const confirmUrl = `${process.env.NEXTAUTH_URL}/confirmar-email?token=${pendingEmailToken}`;

    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Confirme seu novo email — Finanças+",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Confirmar novo email</h2>
          <p>Você solicitou a troca do email da sua conta no Finanças+ para este endereço.</p>
          <p>Clique no link abaixo para confirmar. Esse link expira em 1 hora.</p>
          <p><a href="${confirmUrl}" style="background:#E8B04B;color:#0A0D12;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Confirmar novo email</a></p>
          <p>Se você não solicitou isso, pode ignorar este email — seu email atual continua ativo normalmente.</p>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error("Erro do Resend:", emailResult.error);
      return NextResponse.json(
        { error: "Não foi possível enviar o email de confirmação. Tente novamente." },
        { status: 500 }
      );
    }

    emailChangeRequested = true;
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Informe a senha atual para definir uma nova" },
        { status: 400 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Este usuário não possui senha cadastrada" },
        { status: 400 }
      );
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    dataToUpdate.password = await bcrypt.hash(newPassword, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: dataToUpdate,
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ ...updatedUser, emailChangeRequested });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { password } = body;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (!password) {
    return NextResponse.json(
      { error: "Informe sua senha para confirmar a exclusão" },
      { status: 400 }
    );
  }

  if (!user.password) {
    return NextResponse.json(
      { error: "Este usuário não possui senha cadastrada" },
      { status: 400 }
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ success: true });
}