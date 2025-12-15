"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { users } from "@/db/schema";
import { preCacheAdminStatus } from "@/lib/permissions";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function login(data: {
  email: string;
  password: string;
  remember?: boolean;
}) {
  // Validate input
  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Invalid input",
    };
  }

  const { email: validatedEmail, password: validatedPassword } = validation.data;

  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedEmail,
      password: validatedPassword,
    });

    if (error || !data.session) {
      // Handle email confirmation error
      if (error?.message?.toLowerCase().includes("confirm")) {
        return {
          error: "Please confirm your email before signing in.",
        };
      }

      return {
        error: error?.message || "Invalid email or password",
      };
    }

    // Upsert user profile in Neon via Drizzle
    const userId = data.user.id;
    const userEmail = data.user.email ?? "";
    const fullName =
      (data.user.user_metadata as { full_name?: string } | null)?.full_name ??
      userEmail;
    const lastLoginAt = new Date();

    await db
      .insert(users)
      .values({
        id: userId,
        email: userEmail,
        fullName,
        lastLoginAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userEmail,
          fullName,
          lastLoginAt,
        },
      });

    // Pre-cache admin status and set cookie for fast middleware checks
    try {
      const isAdmin = await preCacheAdminStatus(userId);
      await setAdminStatusCookieForServerAction(userId, isAdmin);
    } catch (error) {
      // Don't fail login if admin check fails, just log it
      console.error("Failed to pre-cache admin status:", error);
    }

    // Supabase client sets auth cookies automatically via the server client
    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Sets admin status cookie for Server Actions
 * Server Actions can use cookies() from next/headers directly
 */
async function setAdminStatusCookieForServerAction(
  userId: string,
  isAdmin: boolean,
): Promise<void> {
  const cookieStore = await cookies();
  const ADMIN_COOKIE_NAME = "bt_admin_status"; // Must match lib/permissions.ts
  const ADMIN_COOKIE_TTL = 30 * 60; // 30 minutes in seconds (must match lib/permissions.ts)

  const timestamp = Math.floor(Date.now() / 1000);
  const cookieValue = `${userId}:${isAdmin}:${timestamp}`;

  cookieStore.set(ADMIN_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_TTL,
    path: "/",
  });
}

export async function signup(data: { email: string; password: string }) {
  // Validate input
  const validation = signupSchema.safeParse(data);
  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Invalid input",
    };
  }

  const { email: validatedEmail, password: validatedPassword } = validation.data;

  try {
    // Guard: prevent duplicate emails in our Neon DB
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedEmail))
      .limit(1);

    if (existing.length > 0) {
      return {
        error: "An account with this email already exists. Please sign in instead.",
      };
    }

    const supabase = await supabaseServer();

    const { data: supabaseData, error } = await supabase.auth.signUp({
      email: validatedEmail,
      password: validatedPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login`,
      },
    });

    // Log detailed signup response for debugging
    console.log("Signup response:", {
      hasUser: !!supabaseData?.user,
      hasSession: !!supabaseData?.session,
      userEmail: supabaseData?.user?.email,
      userConfirmed: supabaseData?.user?.email_confirmed_at ? "Yes" : "No",
      error: error?.message,
    });

    if (error) {
      console.error("Supabase signup error:", error);
      // If the email already exists, return a conflict status
      if (error.message?.toLowerCase().includes("already registered")) {
        return {
          error: "An account with this email already exists. Please sign in instead.",
        };
      }

      return {
        error: error.message,
      };
    }

    // If email confirmation is required, session may be null; still upsert the user record.
    if (supabaseData.user) {
      const userMeta = supabaseData.user.user_metadata || {};
      const fullName = userMeta.full_name || userMeta.name || "";
      const phone = userMeta.phone || null;
      const avatarUrl = userMeta.avatar_url || null;
      const locale = userMeta.locale || "nl-BE";

      await db
        .insert(users)
        .values({
          id: supabaseData.user.id,
          email: supabaseData.user.email ?? "",
          phone,
          fullName,
          avatarUrl,
          locale,
          isActive: true,
          createdAt: supabaseData.user.created_at
            ? new Date(supabaseData.user.created_at)
            : undefined,
          updatedAt: new Date(),
          lastLoginAt: null,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: supabaseData.user.email ?? "",
            phone,
            fullName,
            avatarUrl,
            locale,
            updatedAt: new Date(),
          },
        });
    }

    return {
      success: true,
      user: supabaseData.user,
      session: supabaseData.session, // may be null if email confirmation required
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function logout(): Promise<void> {
  try {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();

    // Clear admin status cookie if it exists
    const cookieStore = await cookies();
    cookieStore.delete("bt_admin_status");
  } catch (error) {
    console.error("Logout error:", error);
  }
  
  // Always redirect to login page (redirect throws, so this never returns)
  redirect("/login");
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function forgotPassword(data: { email: string }) {
  // Validate input
  const validation = forgotPasswordSchema.safeParse(data);
  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Invalid input",
    };
  }

  const { email: validatedEmail } = validation.data;

  try {
    const supabase = await supabaseServer();

    // Send password reset email
    // Note: Supabase will send the email with a reset link
    // We don't check for errors here to prevent email enumeration attacks
    await supabase.auth.resetPasswordForEmail(validatedEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
    });

    // Always return success to prevent email enumeration
    // Don't reveal if email exists or not for security
    return {
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    // Still return success message for security
    return {
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    };
  }
}

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function resetPassword(data: { password: string }) {
  // Validate input
  const validation = resetPasswordSchema.safeParse(data);
  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Invalid input",
    };
  }

  const { password: validatedPassword } = validation.data;

  try {
    const supabase = await supabaseServer();

    // Check if we have a valid authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "No valid session found. Please use the reset link from your email.",
      };
    }

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: validatedPassword,
    });

    if (error) {
      return {
        error: error.message || "Failed to reset password",
      };
    }

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

