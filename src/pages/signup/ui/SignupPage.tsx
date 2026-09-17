import { AuthLayout } from "@/widgets/auth-layout";
import { SignupForm } from "./SignupForm";

export function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
