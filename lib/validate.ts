import { IDENTITY_FIELDS, type Identity } from "./types";

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function validateIdentity(input: Partial<Identity> & { cnic?: string }, adult: boolean) {
  const identity = {} as Identity;
  for (const field of IDENTITY_FIELDS) {
    identity[field.key] = String(input[field.key] ?? "").trim();
  }
  if (!identity.name) return { error: "Enter your full name." };
  if (!identity.mobile) return { error: "Enter a mobile number." };
  if (!emailOk(identity.pemail)) return { error: "Enter a valid personal email. The code is sent there." };
  if (identity.uemail && !emailOk(identity.uemail)) {
    return { error: "University email is optional. Leave it blank, or enter a valid address." };
  }
  if (!adult) return { error: "Confirm you are 18 or older, currently enrolled, and that your details are true." };
  return { identity, cnic: String(input.cnic ?? "").trim() };
}

export function namesMatch(typed: string, fullName: string) {
  return typed.trim().toLowerCase() === fullName.trim().toLowerCase();
}
