import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Lista categorias de despesa com limite e gasto do mês
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
  const monthParam = searchParams.get("month"); // formato "YYYY-MM"

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  if (monthParam) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m;
  }

  const categories = await prisma.category.findMany({
    where: { userId: user.id, type: "despesa" },
    orderBy: { name: "asc" },
  });

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id, month, year },
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "despesa",
      date: { gte: startDate, lt: endDate },
    },
  });

  const result = categories.map((category) => {
    const budget = budgets.find((b) => b.categoryId === category.id);
    const spent = transactions
      .filter((t) => t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      categoryId: category.id,
      name: category.name,
      color: category.color,
      limitValue: budget?.limitValue ?? null,
      spent,
    };
  });

  return NextResponse.json(result);
}

// Cria ou atualiza o limite de uma categoria para um mês/ano
export async function PUT(request: Request) {
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
  const { categoryId, month, year, limitValue } = body;

  if (!categoryId || !month || !year || limitValue === undefined) {
    return NextResponse.json(
      { error: "Categoria, mês, ano e valor são obrigatórios." },
      { status: 400 }
    );
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.userId !== user.id) {
    return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
  }

  const existing = await prisma.budget.findFirst({
    where: { userId: user.id, categoryId, month, year },
  });

  const budget = existing
    ? await prisma.budget.update({
        where: { id: existing.id },
        data: { limitValue },
      })
    : await prisma.budget.create({
        data: { userId: user.id, categoryId, month, year, limitValue },
      });

  return NextResponse.json(budget);
}