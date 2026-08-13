import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Listar todas as transações do usuário logado (com filtros opcionais)
export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // formato "2026-08"
  const categoryId = searchParams.get("categoryId");
  const type = searchParams.get("type");
  const minAmount = searchParams.get("minAmount");
  const maxAmount = searchParams.get("maxAmount");

  const where: any = { userId: user.id };

  if (month) {
    const [year, monthNum] = month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59);
    where.date = { gte: start, lte: end };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (type) {
    where.type = type;
  }

  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount.gte = parseFloat(minAmount);
    if (maxAmount) where.amount.lte = parseFloat(maxAmount);
  }

  const transactions = await prisma.transaction.findMany({
    where,
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