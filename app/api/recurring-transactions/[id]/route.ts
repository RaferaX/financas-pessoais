import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Editar descrição e/ou categoria de uma recorrência (e replicar nas parcelas)
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

  const recurring = await prisma.recurringTransaction.findUnique({
    where: { id },
  });

  if (!recurring || recurring.userId !== user.id) {
    return NextResponse.json({ error: "Recorrência não encontrada." }, { status: 404 });
  }

  const body = await request.json();
  const { description, categoryId } = body;

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== user.id) {
      return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
    }
  }

  const updated = await prisma.recurringTransaction.update({
    where: { id },
    data: {
      description,
      categoryId,
    },
  });

  // Atualiza a categoria também nas parcelas já geradas (a descrição de cada
  // parcela mantém o número "(x/y)", só troca o texto base)
  const transactions = await prisma.transaction.findMany({
    where: { recurringTransactionId: id },
  });

  await Promise.all(
    transactions.map((t) =>
      prisma.transaction.update({
        where: { id: t.id },
        data: {
          categoryId: categoryId || t.categoryId,
          description: description
            ? `${description} (${t.installmentNumber}/${updated.totalInstallments})`
            : t.description,
        },
      })
    )
  );

  return NextResponse.json(updated);
}

// Excluir uma recorrência e todas as suas parcelas
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

  const recurring = await prisma.recurringTransaction.findUnique({
    where: { id },
  });

  if (!recurring || recurring.userId !== user.id) {
    return NextResponse.json({ error: "Recorrência não encontrada." }, { status: 404 });
  }

  // O onDelete: Cascade no schema já apaga as transações vinculadas automaticamente
  await prisma.recurringTransaction.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Recorrência e parcelas excluídas com sucesso." });
}