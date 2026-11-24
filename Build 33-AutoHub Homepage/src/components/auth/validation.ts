import { z } from "zod";
import { passwordRules } from "./PasswordStrength";

export const emailField = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email address");

export const newPasswordField = z
  .string()
  .min(1, "Create a password")
  .refine(
    (value) => passwordRules.every((rule) => rule.test(value)),
    "Use at least 8 characters, one uppercase letter and one number",
  );

/** Formats Algerian mobile digits as "5XX XX XX XX". */
export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^0/, "").slice(0, 9);
  return [digits.slice(0, 3), digits.slice(3, 5), digits.slice(5, 7), digits.slice(7, 9)]
    .filter(Boolean)
    .join(" ");
}

export function getRedirect() {
  return new URLSearchParams(window.location.search).get("redirect");
}
