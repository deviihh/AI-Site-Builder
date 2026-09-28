import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";

const AuthPage = ({ mode }: { mode: "login" | "register" }) => {
  const { user, login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === "login";

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Signed in");
      } else {
        await register(name, email, password);
        toast.success("Account created. You have 20 credits.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-4 rounded-2xl border border-line bg-bp-deep p-8 shadow-sm"
      >
        <h1 className="font-display text-5xl font-bold leading-none text-chalk">
          {isLogin ? "Sign in" : "Create your account"}
        </h1>
        <p className="text-sm text-chalk-dim">
          {isLogin
            ? "Pick up where you left off."
            : "20 credits are included, enough for four websites."}
        </p>

        {!isLogin && (
          <input
            type="text"
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
          />
        )}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />

        <button type="submit" disabled={submitting} className="btn-signal w-full py-3">
          {submitting ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
        </button>

        <p className="text-center text-sm text-chalk-dim">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link
            to={isLogin ? "/register" : "/login"}
            className="text-signal underline-offset-4 hover:underline"
          >
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;