import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const protectedRoutes = ['/dashboard', '/settings', '/accounts', '/budgets', '/transactions', '/goals', '/reports']
const authRoutes = ['/login', '/signup', '/forgot-password', '/']

export default async function proxy(req: NextRequest) {
    let response = NextResponse.next({ request: req })

    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_PUBLISHABLE_KEY
    if (!url || !key) return response

    // Refreshes the Supabase session cookie on every matched request
    const supabase = createServerClient(url, key, {
        cookies: {
            getAll() {
                return req.cookies.getAll()
            },
            setAll(cookiesToSet, headers) {
                cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
                response = NextResponse.next({ request: req })
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                )
                Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v))
            },
        },
    })

    const { data } = await supabase.auth.getClaims()
    const isSignedIn = !!data?.claims?.sub

    // Server Action POSTs must reach their action: redirecting them makes the client
    // receive HTML instead of an RSC payload ("An unexpected response was received").
    // Actions do their own auth checks and redirects.
    if (req.method === 'POST' && req.headers.has('next-action')) {
        return response
    }

    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some((r) => path === r || path.startsWith(`${r}/`))
    const isAuthRoute = authRoutes.includes(path)

    if (isProtectedRoute && !isSignedIn) {
        return redirectWithCookies(new URL('/login', req.nextUrl), response)
    }

    if (isAuthRoute && isSignedIn) {
        return redirectWithCookies(new URL('/dashboard', req.nextUrl), response)
    }

    return response
}

// Keep any refreshed auth cookies when redirecting
function redirectWithCookies(target: URL, from: NextResponse) {
    const redirect = NextResponse.redirect(target)
    from.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
}

export const config = {
    matcher: [
        // Everything except static assets and images
        '/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}
