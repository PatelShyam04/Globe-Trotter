import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const protectedPaths = ['/dashboard', '/trips', '/profile']
      const isProtected = protectedPaths.some((p) => nextUrl.pathname.startsWith(p))

      if (isProtected) {
        if (isLoggedIn) return true
        return false
      }
      if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/signup')) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
