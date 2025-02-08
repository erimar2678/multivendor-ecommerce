import { SignUp } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="h-screen w-full grid place-items-center">
      <SignUp />
    </div>
  )
}
