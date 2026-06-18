import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account | TagShelves",
  description: "Sign up for TagShelves and start printing professional price tags in under 2 minutes.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
