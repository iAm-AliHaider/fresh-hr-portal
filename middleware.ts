import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname
  
  // Skip middleware for API routes, static files, and public pages
  if (
    url.startsWith('/api/') ||
    url.startsWith('/_next/') ||
    url.startsWith('/favicon.ico') ||
    url === '/' ||
    url.startsWith('/careers') ||
    url.startsWith('/auth/')
  ) {
    return NextResponse.next()
  }

  // Check for candidate portal access
  if (url.startsWith('/candidate/')) {
    const candidateAuth = request.cookies.get('candidateAuth')?.value ||
                         request.headers.get('x-candidate-auth')
    
    if (!candidateAuth) {
      return NextResponse.redirect(new URL('/auth/candidate/login', request.url))
    }
    return NextResponse.next()
  }

  // Check for admin/employee dashboard access
  if (url.startsWith('/dashboard') || 
      url.startsWith('/jobs') || 
      url.startsWith('/employees') || 
      url.startsWith('/interviews') ||
      url.startsWith('/recruitment') ||
      url.startsWith('/offers')) {
    
    // Block candidate accounts from accessing these routes
    const candidateAuth = request.cookies.get('candidateAuth')?.value ||
                         request.headers.get('x-candidate-auth')
    
    if (candidateAuth) {
      console.log('Candidate trying to access admin area, redirecting to candidate portal')
      return NextResponse.redirect(new URL('/candidate/portal', request.url))
    }

    // Check for employee/admin auth
    const employeeAuth = request.cookies.get('hr-auth-token')?.value ||
                        request.headers.get('authorization')
    
    if (!employeeAuth) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 