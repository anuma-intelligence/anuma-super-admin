import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { setAccessToken } from "@/api/slices/authSlice";
import { useLoginMutation } from "@/api/services/auth";

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

const readToken = (res) => res?.access || res?.access_token || res?.token || null;

const readError = (err) =>
  err?.data?.detail ||
  err?.data?.error ||
  err?.data?.non_field_errors?.[0] ||
  "Sign-in failed. Check your credentials and try again.";

export default function SignInForm() {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setFieldError("");
    if (!validEmail(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setFieldError("Enter your password.");
      return;
    }
    try {
      const res = await login({ email, password }).unwrap();
      const token = readToken(res);
      if (!token) {
        setFieldError("Login succeeded but no access token returned.");
        return;
      }
      dispatch(setAccessToken(token));
      window.location.replace("/");
    } catch (err) {
      const detail = readError(err);
      setFieldError(detail);
      toast.error(detail);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage plans and merchants across the platform.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
      </div>

      {fieldError ? (
        <p className="mt-3 text-sm text-destructive">{fieldError}</p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1a1a1a] text-sm font-medium text-white transition-colors hover:bg-[#333]",
          "disabled:pointer-events-none disabled:opacity-60",
        )}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
