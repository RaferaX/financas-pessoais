import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Editar uma transação existente
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

  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction || transaction.userId !== user.id) {
    return NextResponse.json({ error: "Transação não encontrada." }, { status: 404 });
  }

  const body = await request.json();
  const { amount, type, description, date, categoryId } = body;

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      amount: amount ? parseFloat(amount) : undefined,
      type,
      description,
      date: date ? new Date(date) : undefined,
      categoryId,
    },
    include: { category: true },
  });

  return NextResponse.json(updated);
}

// Excluir uma transação
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

  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction || transaction.userId !== user.id) {
    return NextResponse.json({ error: "Transação não encontrada." }, { status: 404 });
  }

  await prisma.transaction.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Transação excluída com sucesso." });
}