"use client";

import { useSession } from "@/components/mock-session-provider";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { MOCK_USER, MOCK_PROFILE } from "@/lib/mock-data";

export default function ProfilePage() {
  const { data: session } = useSession();

  // Combine user and profile data
  const user = {
    ...MOCK_USER,
    ...(session?.user || {})
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and interview preferences (View Only)
        </p>
      </div>

      <div className="opacity-80 pointer-events-none grayscale-[0.3]">
        <ProfileForm
          user={user}
          profile={MOCK_PROFILE}
        />
        <div className="mt-8">
          <PasswordForm />
        </div>
      </div>

      <div className="fixed bottom-10 right-10 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg z-50">
        View Only Mode
      </div>
    </div>
  );
}
