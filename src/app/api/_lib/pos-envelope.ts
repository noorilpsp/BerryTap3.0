import { NextResponse } from "next/server";

type SuccessOptions = {
  status?: number;
  correlationId?: string;
};

type FailureOptions = {
  status?: number;
  correlationId?: string;
};

export function posSuccess<T>(data: T, options: SuccessOptions = {}) {
  const { status = 200, correlationId } = options;
  return NextResponse.json(
    {
      ok: true as const,
      data,
      ...(correlationId ? { correlationId } : {}),
    },
    { status }
  );
}

export function posFailure(
  code: string,
  message: string,
  options: FailureOptions = {}
) {
  const { status = 400, correlationId } = options;
  return NextResponse.json(
    {
      ok: false as const,
      error: {
        code,
        message,
      },
      ...(correlationId ? { correlationId } : {}),
    },
    { status }
  );
}

export function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
