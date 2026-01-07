import { auth } from "@/app/auth";
import UserActions from "./userActions";

export default async function User() {
  const session = await auth();

  return <UserActions session={session} />;
}
