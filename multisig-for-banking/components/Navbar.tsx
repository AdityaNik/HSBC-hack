"use client";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export const Navbar = () => {
  const router = useRouter();

  return (
    <div className="flex flex-row justify-between p-4">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        MultiSig
      </h1>
      <div className="flex gap-4">
        <div className="flex gap-2">
          <Button
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </Button>
          <Button
            onClick={() => {
              router.push("/register");
            }}
          >
            Register
          </Button>
        </div>
        <ModeToggle />
      </div>
    </div>
  );
};
