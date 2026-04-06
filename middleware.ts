import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const protectedPaths = ['/profile'];
        const isProtected = protectedPaths.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        );
        if (isProtected) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/profile/:path*'],
};
