"use client";

import { ReactNode, useEffect, useRef } from "react";
import { ConvexReactClient, useMutation, useConvexAuth } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Only create the client if the URL is available
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

/**
 * Component that syncs Clerk user data to Convex on sign-in
 * This replaces the webhook approach
 */
function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session when user is authenticated with Convex
    // Using isAuthenticated from Convex ensures the auth token is ready
    if (isAuthenticated && user && !hasSynced.current) {
      hasSynced.current = true;

      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined;

      syncUser({
        email,
        name,
        imageUrl: user.imageUrl,
      }).catch((error) => {
        // Reset flag on error so it can retry
        hasSynced.current = false;
        console.error("Failed to sync user to Convex:", error);
        toast.error("Failed to sync your profile", {
          description: "Some features may not work correctly. Please refresh the page.",
        });
      });
    }

    // Reset when user signs out
    if (!isAuthenticated) {
      hasSynced.current = false;
    }
  }, [isAuthenticated, user, syncUser]);

  return null;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // If Convex isn't configured, just render children without the provider
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <UserSync />
      {children}
    </ConvexProviderWithClerk>
  );
}
