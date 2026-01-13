import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas públicas que não requerem autenticação
const publicRoutes = ["/auth/login", "/auth/register", "/auth/error"]

export default withAuth(
  function middleware(request: any) {
    const pathname = request.nextUrl.pathname
    const isPublicRoute = publicRoutes.includes(pathname)

    // Se estiver autenticado e tentar acessar rotas públicas, redireciona para home
    const isAuth = !!request.nextauth?.token
    if (isAuth && isPublicRoute && !pathname.includes("/error")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Adicionar header com ID do usuário para logs
    const requestHeaders = new Headers(request.headers)
    if (request.nextauth?.token?.id) {
      requestHeaders.set("x-user-id", request.nextauth.token.id as string)
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  },
  {
    callbacks: {
      async authorized({ token, req }) {
        const pathname = req.nextUrl.pathname

        // Rotas públicas são sempre permitidas
        if (publicRoutes.includes(pathname)) {
          return true
        }

        // Rotas protegidas requerem autenticação
        if (pathname.startsWith("/api/")) {
          // APIs protegidas
          if (pathname.startsWith("/api/auth/register") || pathname.startsWith("/api/auth/callback")) {
            return true
          }
          return !!token
        }

        // Páginas protegidas
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
