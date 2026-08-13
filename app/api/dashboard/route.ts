import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

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
  const monthParam = searchParams.get("month"); // formato "2026-08"

  const now = new Date();
  const year = monthParam ? parseInt(monthParam.split("-")[0]) : now.getFullYear();
  const monthIndex = monthParam ? parseInt(monthParam.split("-")[1]) - 1 : now.getMonth();

  const startOfMonth = new Date(year, monthIndex, 1);
  const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);

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