import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Editar uma categoria existente
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

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category || category.userId !== user.id) {
    return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
  }

  const body = await request.json();
  const { name, type, color, icon, isInvestment } = body;

  const updated = await prisma.category.update({
    where: { id },
    data: { name, type, color, icon, isInvestment },
  });

  return NextResponse.json(updated);
}

// Excluir uma categoria
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

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category || category.userId !== user.id) {
    return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
  }

  await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Categoria excluída com sucesso." });
}