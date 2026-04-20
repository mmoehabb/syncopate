"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { bugApi } from "@syncopate/api";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const handleReportBug = async () => {
    try {
      await bugApi.reportBug({
        message: error.message,
        stack: error.stack,
        url: window.location.href,
      });
      showToast("Bug reported successfully. Thank you!", "success");
      router.push("/");
    } catch (err) {
      console.error("Failed to report bug:", err);
      showToast("Failed to report bug. Please try again later.", "error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-obsidian-night text-white font-mono p-4">
      <div className="max-w-md w-full flex flex-col gap-6 items-center text-center p-8 bg-void-grey border border-white/10 rounded-md shadow-2xl">
        <div className="text-4xl text-neon-pulse mb-2">:(</div>
        <h2 className="text-2xl font-bold">Oops! Something went wrong.</h2>
        <p className="text-syntax-grey text-sm">
          We encountered an unexpected error while processing your request.
        </p>

        <div className="flex gap-4 w-full mt-4">
          <button
            onClick={() => reset()}
            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono py-2 rounded transition-colors"
          >
            Try again
          </button>
          <button
            onClick={handleReportBug}
            className="flex-1 bg-git-green text-obsidian-night font-bold hover:bg-opacity-90 font-mono py-2 rounded transition-opacity"
          >
            Report Bug
          </button>
        </div>
      </div>
    </div>
  );
}
