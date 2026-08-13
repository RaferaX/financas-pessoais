import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Listar metas com o progresso calculado
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

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  // Para cada meta, soma o que já foi lançado na categoria vinculada
  const goalsWithProgress = await Promise.all(
    goals.map(async (goal) => {
      const transactions = await prisma.transaction.findMany({
        where: { categoryId: goal.categoryId, userId: user.id },
      });

      const currentAmount = transactions.reduce((sum, t) => {
        return sum + (t.type === "receita" ? t.amount : -t.amount);
      }, 0);

      const progress = Math.min(
        Math.max((currentAmount / goal.targetAmount) * 100, 0),
        100
      );

      return { ...goal, currentAmount, progress };
    })
  );

  return NextResponse.json(goalsWithProgress);
}

// Criar uma nova meta
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
  const { name, targetAmount, deadline, categoryId } = body;

  if (!name || !targetAmount || !categoryId) {
    return NextResponse.json(
      { error: "Nome, valor-alvo e categoria são obrigatórios." },
      { status: 400 }
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.userId !== user.id) {
    return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  }

  if (!category.isInvestment) {
    return NextResponse.json(
      { error: "A meta precisa estar vinculada a uma categoria de investimento." },
      { status: 400 }
    );
  }

  const goal = await prisma.savingsGoal.create({
    data: {
      name,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline ? new Date(deadline) : null,
      userId: user.id,
      categoryId,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}