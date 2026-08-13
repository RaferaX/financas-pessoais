import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Editar uma meta
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const goal = await prisma.savingsGoal.findUnique({
    where: { id },
  });

  if (!goal || goal.userId !== user.id) {
    return NextResponse.json({ error: "Meta não encontrada." }, { status: 404 });
  }

  const body = await request.json();
  const { name, targetAmount, deadline } = body;

  const updated = await prisma.savingsGoal.update({
    where: { id },
    data: {
      name,
      targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return NextResponse.json(updated);
}

// Excluir uma meta
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const goal = await prisma.savingsGoal.findUnique({
    where: { id },
  });

  if (!goal || goal.userId !== user.id) {
    return NextResponse.json({ error: "Meta não encontrada." }, { status: 404 });
  }

  await prisma.savingsGoal.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Meta excluída com sucesso." });
}