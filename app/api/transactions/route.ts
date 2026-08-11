import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Listar todas as transações do usuário logado
export async function GET() {
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

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

// Criar uma nova transação
export async function POST(request: Request) {
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

  const body = await request.json();
  const { amount, type, description, date, categoryId } = body;

  if (!amount || !type || !categoryId) {
    return NextResponse.json(
      { error: "Valor, tipo e categoria são obrigatórios." },
      { status: 400 }
    );
  }

  // Confirma que a categoria pertence a esse usuário
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.userId !== user.id) {
    return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      description,
      date: date ? new Date(date) : new Date(),
      categoryId,
      userId: user.id,
    },
    include: { category: true },
  });

  return NextResponse.json(transaction, { status: 201 });
}