"use client";

import { useState, useEffect } from "react";
import {
  deactivateAccount,
  reactivateAccount,
  cancelSubscription,
} from "../actions";
import { useRouter } from "next/navigation";

interface AccountSettingsProps {
  userId: string;
  isActive: boolean;
  subscription: any;
}

export function AccountSettings({
  userId,
  isActive,
  subscription,
}: AccountSettingsProps) {
  const router = useRouter();
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [deactivateCountdown, setDeactivateCountdown] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDeactivateDialogOpen && deactivateCountdown > 0) {
      timer = setTimeout(() => {
        setDeactivateCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isDeactivateDialogOpen, deactivateCountdown]);

  const handleOpenDeactivateDialog = () => {
    setIsDeactivateDialogOpen(true);
    setDeactivateCountdown(5);
  };

  const handleDeactivate = async () => {
    setIsSubmitting(true);
    await deactivateAccount(userId);
    setIsSubmitting(false);
    setIsDeactivateDialogOpen(false);
  };

  const handleReactivate = async () => {
    setIsSubmitting(true);
    await reactivateAccount(userId);
    setIsSubmitting(false);
  };

  const handleCancelSubscription = async () => {
    if (subscription?.id) {
      setIsSubmitting(true);
      await cancelSubscription(userId, subscription.id);
      setIsSubmitting(false);
    }
  };

  const handleResubscribe = () => {
    if (!subscription) {
      router.push("/plans");
    } else {
      // TODO: Invoke payment provider
      console.log("TODO: Invoke payment provider");
    }
  };

  return (
    <div className="max-w-xl mx-auto border border-white/10 bg-void-grey p-6 shadow-xl">
      <h2 className="text-xl font-bold font-mono text-white mb-6">
        Account Settings
      </h2>

      {/* Subscription Section */}
      <div className="mb-8 border-b border-white/10 pb-8">
        <h3 className="text-lg font-bold font-mono text-white mb-4">
          Subscription
        </h3>

        {subscription ? (
          <div className="space-y-4">
            <div className="text-sm font-mono text-syntax-grey">
              Status: {subscription.status}
              {subscription.cancelAtPeriodEnd && " (Canceling at period end)"}
            </div>

            {subscription.status === "ACTIVE" &&
              !subscription.cancelAtPeriodEnd &&
              subscription.price?.plan?.name !== "Free" && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={isSubmitting}
                  className="w-full bg-red-500/20 text-red-500 border border-red-500/50 font-bold font-mono py-2 hover:bg-red-500/30 transition-colors disabled:opacity-50 cmd-selectable [&.cmd-selected]:ring-2 [&.cmd-selected]:ring-red-500 [&.cmd-selected]:ring-offset-2 [&.cmd-selected]:ring-offset-void-grey"
                >
                  Cancel Subscription
                </button>
              )}

            {subscription.status === "ACTIVE" &&
              !subscription.cancelAtPeriodEnd &&
              subscription.price?.plan?.name === "Free" && (
                <button
                  onClick={() => router.push("/plans")}
                  className="w-full bg-git-green text-obsidian-night font-bold font-mono py-2 hover:bg-opacity-90 transition-opacity cmd-selectable [&.cmd-selected]:ring-2 [&.cmd-selected]:ring-white [&.cmd-selected]:ring-offset-2 [&.cmd-selected]:ring-offset-void-grey"
                >
                  Upgrade
                </button>
              )}

            {(!subscription ||
              subscription.cancelAtPeriodEnd ||
              subscription.status === "CANCELED") && (
              <button
                onClick={handleResubscribe}
                className="w-full bg-git-green text-obsidian-night font-bold font-mono py-2 hover:bg-opacity-90 transition-opacity cmd-selectable [&.cmd-selected]:ring-2 [&.cmd-selected]:ring-white [&.cmd-selected]:ring-offset-2 [&.cmd-selected]:ring-offset-void-grey"
              >
                Resubscribe
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-mono text-syntax-grey">
              You do not have an active subscription.
            </div>
            <button
              onClick={handleResubscribe}
              className="w-full bg-git-green text-obsidian-night font-bold font-mono py-2 hover:bg-opacity-90 transition-opacity cmd-selectable [&.cmd-selected]:ring-2 [&.cmd-selected]:ring-white [&.cmd-selected]:ring-offset-2 [&.cmd-selected]:ring-offset-void-grey"
            >
              Subscribe
            </button>
          </div>
        )}
      </div>

      {/* Account Section */}
      <div>
        <h3 className="text-lg font-bold font-mono text-white mb-4">
          Deactivation
        </h3>

        {!isActive ? (
          <button
            onClick={handleReactivate}
            disabled={isSubmitting}
            className="w-full bg-git-green text-obsidian-night font-bold font-mono py-2 hover:bg-opacity-90 transition-opacity disabled:opacity-50 cmd-selectable [&.cmd-selected]:ring-2 [&.cmd-selected]:ring-white [&.cmd-selected]:ring-offset-2 [&.cmd-selected]:ring-offset-void-grey"
          >
            {isSubmitting ? "Reactivating..." : "Reactivate Account"}
          </button>
        ) : (
          <button
            onClick={handleOpenDeactivateDialog}
            className="w-full bg-red-500/20 text-red-500 border border-red-500/50 font-bold font-mono py-2 hover:bg-red-500/30 transition-colors cmd-selectable [&.cmd-selected]:ring-2 [&.cmd-selected]:ring-red-500 [&.cmd-selected]:ring-offset-2 [&.cmd-selected]:ring-offset-void-grey"
          >
            Deactivate Account
          </button>
        )}
      </div>

      {/* Deactivate Confirmation Dialog */}
      {isDeactivateDialogOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-void-grey border border-red-500/50 p-6 max-w-md w-full shadow-2xl cmd-container cmd-active-container">
            <h3 className="text-xl font-bold text-red-500 mb-4 font-mono">
              Confirm Deactivation
            </h3>
            <p className="text-white/80 font-mono text-sm mb-4">
              Are you sure you want to deactivate your account?
            </p>
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-200 font-mono text-sm">
                <strong>Warning:</strong> All boards where you are an ADMIN will
                be deactivated. This action will not affect other members, but
                the board will appear as inactive to them.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsDeactivateDialogOpen(false)}
                className="flex-1 bg-white/10 text-white font-mono py-2 hover:bg-white/20 transition-colors cmd-selectable [&.cmd-selected]:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivateCountdown > 0 || isSubmitting}
                className="flex-1 bg-red-500 text-white font-bold font-mono py-2 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cmd-selectable [&.cmd-selected]:ring-2 [&.cmd-selected]:ring-white [&.cmd-selected]:ring-offset-2 [&.cmd-selected]:ring-offset-void-grey"
              >
                {isSubmitting
                  ? "Deactivating..."
                  : deactivateCountdown > 0
                    ? `Wait (${deactivateCountdown}s)`
                    : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
