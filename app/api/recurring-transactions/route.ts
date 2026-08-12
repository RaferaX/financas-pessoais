import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Criar uma transação recorrente/parcelada, gerando todas as parcelas
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
  const { description, amount, type, totalInstallments, startDate, categoryId } = body;

  if (!description || !amount || !type || !totalInstallments || !categoryId) {
    return NextResponse.json(
      { error: "Todos os campos são obrigatórios." },
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

  const start = startDate ? new Date(startDate) : new Date();

  // Cria a "receita" da recorrência
  const recurring = await prisma.recurringTransaction.create({
    data: {
      description,
      amount: parseFloat(amount),
      type,
      totalInstallments: parseInt(totalInstallments),
      startDate: start,
      userId: user.id,
      categoryId,
    },
  });

  // Gera todas as parcelas, uma por mês, a partir da data de início
  const installments = Array.from({ length: recurring.totalInstallments }, (_, i) => {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);

    return {
      amount: recurring.amount,
      type: recurring.type,
      description: `${recurring.description} (${i + 1}/${recurring.totalInstallments})`,
      date,
      userId: user.id,
      categoryId,
      recurringTransactionId: recurring.id,
      installmentNumber: i + 1,
    };
  });

  await prisma.transaction.createMany({ data: installments });

  return NextResponse.json(recurring, { status: 201 });
}

// Listar as recorrências do usuário
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

  const recurring = await prisma.recurringTransaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recurring);
}