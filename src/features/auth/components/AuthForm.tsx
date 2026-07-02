import { useState, type FormEvent } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";

type AuthMode = "login" | "register";

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName.trim() || undefined);
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Anmeldung fehlgeschlagen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="auth-heading">
      <h2 id="auth-heading">
        {mode === "login" ? "Anmelden" : "Registrieren"}
      </h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="auth-form__field">
            <span>Name (optional)</span>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
        ) : null}

        <label className="auth-form__field">
          <span>E-Mail</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="auth-form__field">
          <span>Passwort</span>
          <input
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {formError ? <p className="auth-form__error">{formError}</p> : null}

        <button
          className="auth-form__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Bitte warten…"
            : mode === "login"
              ? "Anmelden"
              : "Konto erstellen"}
        </button>
      </form>

      <p className="auth-form__toggle">
        {mode === "login" ? "Noch kein Konto?" : "Bereits registriert?"}{" "}
        <button
          type="button"
          className="auth-form__link"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setFormError(null);
          }}
        >
          {mode === "login" ? "Registrieren" : "Anmelden"}
        </button>
      </p>
    </section>
  );
}
