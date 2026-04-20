"use client";

import React, { useEffect, useState } from "react";
import { useCommand } from "../../context/CommandContext";

export function DeleteConfirmationModal() {
  const { deleteModalState, setDeleteModalState } = useCommand();
  const [countdown, setCountdown] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!deleteModalState.isOpen) {
      setCountdown(10);
      setIsDeleting(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [deleteModalState.isOpen]);

  if (!deleteModalState.isOpen) return null;

  const handleConfirm = async () => {
    if (countdown > 0 || isDeleting) return;
    setIsDeleting(true);
    try {
      if (deleteModalState.onConfirm) {
        await deleteModalState.onConfirm();
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalState({ isOpen: false });
    }
  };

  const handleCancel = () => {
    setDeleteModalState({ isOpen: false });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-void-grey border border-red-500 shadow-2xl p-6 max-w-md w-full cmd-container cmd-active-container">
        <h2 className="text-xl font-bold font-mono text-red-500 mb-4">
          Strict Warning
        </h2>
        <p className="text-syntax-grey font-mono text-sm mb-6">
          {deleteModalState.message}
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-mono py-2 transition-colors cmd-selectable [&.cmd-selected]:bg-white/20 [&.cmd-selected]:border [&.cmd-selected]:border-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={countdown > 0 || isDeleting}
            className={`flex-1 font-mono font-bold py-2 transition-all cmd-selectable [&.cmd-selected]:ring-2 [&.cmd-selected]:ring-white ${
              countdown > 0
                ? "bg-red-900/50 text-red-500/50 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isDeleting
              ? "Deleting..."
              : countdown > 0
                ? `Wait ${countdown}s`
                : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
