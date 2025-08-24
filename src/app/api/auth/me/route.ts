import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const store = await cookies();
  const session = store.get('session')?.value;
  if (session === 'raptor-session') {
    return NextResponse.json({
      authenticated: true,
      user: { username: 'raptor' },
    });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
