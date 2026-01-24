import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatar: true },
    }),
    prisma.profile.findUnique({
      where: { userId },
    }),
  ]);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and interview preferences
        </p>
      </div>

      <ProfileForm
        user={user}
        profile={
          profile
            ? {
                ...profile,
                skills: JSON.parse(profile.skills),
                targetCompanies: JSON.parse(profile.targetCompanies),
              }
            : null
        }
      />
    </div>
  );
}
