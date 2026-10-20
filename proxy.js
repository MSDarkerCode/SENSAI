import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/resume",
  "/interview",
  "/ai-cover-letter",
  "/onboarding",
];

const isProtectedRoute = (req) => {
  const pathname = req.nextUrl.pathname;

  return protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );
};

export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api/inngest")) {
    return NextResponse.next();
  }

  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/inngest|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/api/:path*",
    "/trpc/:path*",
  ],
};