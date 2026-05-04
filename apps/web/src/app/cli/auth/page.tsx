import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "./AuthForm";

export default async function CliAuthPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;

  if (!session?.user?.id) {
    // Generate the path to redirect back to.
    let port = searchParams.port;
    if (Array.isArray(port)) {
      port = port[0];
    }
    const redirectPath = `/cli/auth${port ? `?port=${port}` : ""}`;
    redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
          Loading...
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
