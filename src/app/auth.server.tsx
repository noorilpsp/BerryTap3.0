import { getUser } from "@/lib/queries";
import { LoginForm } from "@/components/login-form";

export async function AuthServer() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  return (
    <span className="text-sm text-muted-foreground">
      {user.username ?? user.email ?? "Account"}
    </span>
  );
}

export async function PlaceOrderAuth() {
  const user = await getUser();
  if (user) {
    return null;
  }

  return (
    <>
      <p className="font-semibold text-accent1">Log in to place an order</p>
      <LoginForm />
    </>
  );
}
