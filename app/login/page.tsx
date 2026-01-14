import type { Metadata } from "next";
import { GalleryVerticalEnd } from "lucide-react"
import { redirect } from "next/navigation"
import Image from "next/image"

import { LoginForm } from "@/components/login-form"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Proultima account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/client/dashboard");
  }

  async function signIn(formData: FormData) {
    "use server"
    
    const supabase = await createSupabaseServerClient()

    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "").trim()
    const redirectToRaw = String(formData.get("redirectTo") ?? "/client/dashboard")
    const redirectTo = redirectToRaw.startsWith("/") ? redirectToRaw : "/client/dashboard"

    // Validate input
    if (!email || !password) {
      redirect(`/login?error=${encodeURIComponent("Email and password are required")}`)
    }

    try {
      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // Handle authentication errors
      if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message || "Invalid email or password")}`)
      }

      // Check if sign in was successful
      if (!data?.user) {
        redirect(`/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`)
      }

      // Successful login - redirect to dashboard or requested page
      redirect(redirectTo)
    } catch (error: unknown) {
      // Check if this is a Next.js redirect error (NEXT_REDIRECT)
      // Redirect errors have a specific structure and should be rethrown
      if (
        error &&
        typeof error === "object" &&
        ("digest" in error || (error as any).__NEXT_REDIRECT)
      ) {
        // This is a Next.js redirect, rethrow it to allow the redirect to proceed
        throw error
      }
      
      // Handle actual errors (not redirects)
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred. Please try again."
      redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
    }
  }

  const errorParam = sp.error
  const error =
    typeof errorParam === "string" ? decodeURIComponent(errorParam) : undefined

  const redirectedFromParam = sp.redirectedFrom
  const redirectTo =
    typeof redirectedFromParam === "string" ? redirectedFromParam : "/client/dashboard"

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/login" className="flex items-center gap-2 font-medium">
          <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Image src="/image/logo.png" alt="Proultima" width={30} height={30} />
            </div>
            Proultima.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm action={signIn} error={error} redirectTo={redirectTo} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/image/login.jpg"
          alt="Image"
          fill
          sizes="50vw"
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
