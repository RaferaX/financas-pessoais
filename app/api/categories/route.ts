import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Listar todas as categorias do usuário logado
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

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

// Criar uma nova categoria
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
  const { name, type, color, icon, isInvestment } = body;

  if (!name || !type) {
    return NextResponse.json(
      { error: "Nome e tipo são obrigatórios." },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      type,
      color: color || "#6366f1",
      icon,
      isInvestment: isInvestment || false,
      userId: user.id,
    },
  });

  return NextResponse.json(category, { status: 201 });
}