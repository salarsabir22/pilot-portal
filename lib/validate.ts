import { IDENTITY_FIELDS, type Identity } from "./types";

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function dobError(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "Enter your date of birth.";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const born = new Date(year, month - 1, day);
  if (born.getFullYear() !== year || born.getMonth() !== month - 1 || born.getDate() !== day) {
    return "Enter a valid date of birth.";
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (born > today) return "Date of birth cannot be in the future.";
  let age = today.getFullYear() - born.getFullYear();
  const monthDelta = today.getMonth() - born.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < born.getDate())) age -= 1;
  if (age < 18) return "You must be at least 18 to sign.";
  return "";
}

export function formatCnic(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

type IdentityResult = { ok: false; error: string } | { ok: true; identity: Identity; cnic: string };

export function validateIdentity(input: Partial<Identity> & { cnic?: string }, adult: boolean): IdentityResult {
  const identity = {} as Identity;
  for (const field of IDENTITY_FIELDS) {
    identity[field.key] = String(input[field.key] ?? "").trim();
  }
  if (!identity.name) return { ok: false, error: "Enter your full name." };
  const born = dobError(identity.dob);
  if (born) return { ok: false, error: born };
  if (!identity.mobile) return { ok: false, error: "Enter a mobile number." };
  if (!emailOk(identity.pemail)) return { ok: false, error: "Enter a valid personal email. The code is sent there." };
  if (identity.uemail && !emailOk(identity.uemail)) {
    return { ok: false, error: "University email is optional. Leave it blank, or enter a valid address." };
  }
  const cnic = formatCnic(String(input.cnic ?? ""));
  if (!cnic) return { ok: false, error: "Enter your CNIC number." };
  if (!/^\d{5}-\d{7}-\d$/.test(cnic)) return { ok: false, error: "Enter a 13-digit CNIC, for example 35202-1234567-1." };
  if (!adult) return { ok: false, error: "Confirm you are 18 or older, currently enrolled, and that your details are true." };
  return { ok: true, identity, cnic };
}

export function namesMatch(typed: string, fullName: string) {
  return typed.trim().toLowerCase() === fullName.trim().toLowerCase();
}
