import { NextResponse } from 'next/server';

// Hard-coded credentials (as requested)
const USERNAME = 'raptor';
const PASSWORD = '0424';
const SESSION_VALUE = 'raptor-session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (username === USERNAME && password === PASSWORD) {
      const res = NextResponse.json({ success: true });
      // 8 hour session
      res.cookies.set('session', SESSION_VALUE, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
        secure: process.env.NODE_ENV === 'production',
      });
      return res;
    }
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (e) {
    console.log('Login error:', e);
    return NextResponse.json(
      { success: false, error: 'Bad request' },
      { status: 400 }
    );
  }
}
