import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "../../api/auth";
import { useNavigate } from "react-router-dom";

export function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        navigate("/nearby");
      } else {
        await signUpWithEmail(email, password);
        setMessage(
          "Account created. Check your email if confirmation is enabled.",
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Auth failed");
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "80px auto" }}>
      <h1>{mode === "signin" ? "Sign in" : "Create account"}</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
        />

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
        />

        <button type="submit">
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Need an account?" : "Already have an account?"}
      </button>

      {message ? <p>{message}</p> : null}
    </main>
  );
}
