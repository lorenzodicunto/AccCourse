import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;

    if (!hash) {
      return NextResponse.json(
        { error: "Hash de validação não fornecido" },
        { status: 400 }
      );
    }

    // For now, return a placeholder - full validation requires DB storage
    // This route can be extended later to validate certificates stored in the database
    return NextResponse.json({
      valid: false,
      message: "Validação de certificado requer integração com banco de dados",
      hash,
    });
  } catch (error) {
    console.error("[Certificate Validation Error]", error);
    return NextResponse.json(
      { error: "Erro ao validar certificado" },
      { status: 500 }
    );
  }
}
