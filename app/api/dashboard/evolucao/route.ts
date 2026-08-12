import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

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

  const now = new Date();
  const mesesAtras = 6;
  const mesesAFrente = 6;

  const startRange = new Date(now.getFullYear(), now.getMonth() - (mesesAtras - 1), 1);
  const endRange = new Date(now.getFullYear(), now.getMonth() + mesesAFrente + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startRange, lte: endRange },
    },
    include: { category: true },
  });

  const meses: {
    key: string;
    label: string;
    receitas: number;
    despesas: number;
    projetado: boolean;
  }[] = [];

  for (let i = mesesAtras - 1; i >= -mesesAFrente; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short" });
    const projetado = i < 0;
    meses.push({ key, label, receitas: 0, despesas: 0, projetado });
  }

  transactions.forEach((t) => {
    if (t.category.isInvestment) return;

    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const mes = meses.find((m) => m.key === key);

    if (mes) {
      if (t.type === "receita") {
        mes.receitas += t.amount;
      } else {
        mes.despesas += t.amount;
      }
    }
  });

  return NextResponse.json(meses);
}