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

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
  });

  let totalInvestido = 0;
  let receitasDiaADia = 0;
  let despesasDiaADia = 0;

  transactions.forEach((t) => {
    if (t.category.isInvestment) {
      // Investimento sempre soma no total investido, seja receita ou despesa
      const valor = t.type === "receita" ? t.amount : -t.amount;
      totalInvestido += valor;
    } else if (t.type === "receita") {
      receitasDiaADia += t.amount;
    } else {
      despesasDiaADia += t.amount;
    }
  });

  const saldoDiaADia = receitasDiaADia - despesasDiaADia;
  const patrimonioTotal = totalInvestido + saldoDiaADia;

  return NextResponse.json({
    receitasDiaADia,
    despesasDiaADia,
    saldoDiaADia,
    totalInvestido,
    patrimonioTotal,
  });
}