"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  User,
} from "@heroui/react";

import { logout, login } from "@/app/actions";

export default function UserActions({ session }: { session: any }) {
  console.log(session);
  if (!session?.user)
    return (
      <Button
        onPress={async () => {
          await login();
        }}
      >
        Signin with GitHub
      </Button>
    );

  return (
    <Dropdown>
      <DropdownTrigger>
        <User
          className="cursor-pointer"
          avatarProps={{
            src: session.user.image,
          }}
          description={session.user.email}
          name={session.user.name}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem
          key="Logout"
          onClick={async () => {
            await logout();
          }}
        >
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
