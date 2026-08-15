import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha precisa ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe uma conta com esse email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/verificar-email?token=${verificationToken}`;

    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Confirme seu email — Finanças+",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Bem-vindo ao Finanças+</h2>
          <p>Falta pouco para começar a organizar suas finanças. Confirme seu email clicando no link abaixo.</p>
          <p>Esse link expira em 24 horas.</p>
          <p><a href="${verifyUrl}" style="background:#E8B04B;color:#0A0D12;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Confirmar email</a></p>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error("Erro do Resend:", emailResult.error);
      // Não bloqueia o cadastro — usuário pode reenviar depois pelo login
    }

    return NextResponse.json(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar usuário." },
      { status: 500 }
    );
  }
}