"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CliAuthPage() {
  const searchParams = useSearchParams();
  const port = searchParams.get("port");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuthorize = async () => {
    if (!port) {
      setErrorMsg("Missing port parameter.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/cli", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to generate token");
      }

      const { token } = await res.json();

      // Redirect to the CLI local server
      window.location.href = `http://localhost:${port}?token=${token}`;
      setStatus("success");
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-8 border border-gray-700 rounded-lg bg-gray-800">
          <h1 className="text-2xl font-bold mb-4">CLI Authorized!</h1>
          <p className="text-gray-300">
            You can safely close this page and return to your terminal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-8 border border-gray-700 rounded-lg bg-gray-800 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Authorize CLI</h1>
        <p className="text-gray-300 mb-6">
          Syncopate CLI is requesting access to your account.
        </p>

        {status === "error" && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
            {errorMsg}
          </div>
        )}

        <Button
          onClick={handleAuthorize}
          disabled={status === "loading" || !port}
          className="w-full"
        >
          {status === "loading" ? "Authorizing..." : "Authorize CLI"}
        </Button>
      </div>
    </div>
  );
}
