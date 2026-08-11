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
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    include: { category: true },
  });

  let totalReceitas = 0;
  let totalDespesas = 0;
  let totalInvestidoMes = 0;

  const despesasPorCategoria: Record<string, { name: string; color: string; total: number }> = {};

  transactions.forEach((t) => {
    if (t.category.isInvestment) {
      const valor = t.type === "receita" ? t.amount : -t.amount;
      totalInvestidoMes += valor;
      return;
    }

    if (t.type === "receita") {
      totalReceitas += t.amount;
    } else {
      totalDespesas += t.amount;

      const key = t.category.id;
      if (!despesasPorCategoria[key]) {
        despesasPorCategoria[key] = {
          name: t.category.name,
          color: t.category.color,
          total: 0,
        };
      }
      despesasPorCategoria[key].total += t.amount;
    }
  });

  const saldo = totalReceitas - totalDespesas;

  return NextResponse.json({
    totalReceitas,
    totalDespesas,
    saldo,
    totalInvestidoMes,
    despesasPorCategoria: Object.values(despesasPorCategoria),
  });
}