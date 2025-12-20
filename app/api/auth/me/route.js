import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';

export async function GET() {
  const result = await getCurrentUser();
  
  if (!result.success || !result.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({ user: result.user });
}
