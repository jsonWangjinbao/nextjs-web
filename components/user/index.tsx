"use client";
import UserActions from "./userActions";
import { useSession } from "next-auth/react";

export default function User() {
  const { data: session } = useSession();

  return <UserActions session={session} />;
}
