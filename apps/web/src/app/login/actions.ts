"use server";

import { signIn } from "@/lib/auth";

export async function signInWithGithub(formData?: FormData) {
  const redirectTo = formData?.get("redirectTo")?.toString() || "/dashboard";
  await signIn("github", { redirectTo });
}
