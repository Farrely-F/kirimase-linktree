"use client";
import UpdateNameCard from "./UpdateNameCard";
import UpdateEmailCard from "./UpdateEmailCard";
import { AuthSession } from "@/lib/auth/utils";
import { UpdateAvatarCard } from "./UpdateAvatarCard";

export default function UserSettings({
  session,
}: {
  session: AuthSession["session"];
}) {
  return (
    <>
      <UpdateAvatarCard avatar={session?.user.avatar ?? ""} />
      <UpdateNameCard name={session?.user.name ?? ""} />
      <UpdateEmailCard email={session?.user.email ?? ""} />
    </>
  );
}
