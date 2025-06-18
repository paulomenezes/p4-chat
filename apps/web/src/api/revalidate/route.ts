import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  revalidatePath(path);

  return NextResponse.json({ message: 'Revalidated' });
}
