import { IDENTITY_FIELDS, type Identity } from "./types";

const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function normalizeMobile(value: string) {
  const digits = value.replace(/[^\d+]/g, "");
  if (/^03\d{9}$/.test(digits)) return digits;
  if (/^\+923\d{9}$/.test(digits)) return digits;
  if (/^923\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}

export function parseDob(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function isAtLeast18(value: string) {
  const dob = parseDob(value);
  if (!dob) return false;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const month = now.getMonth() - dob.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age >= 18 && age < 100;
}

export function validateIdentity(input: Partial<Identity> & { cnic?: string }, adult: boolean) {
  const identity = {} as Identity;
  for (const field of IDENTITY_FIELDS) {
    const value = String(input[field.key] ?? "").trim();
    if (!value) return { error: `Fill every field. Missing: ${field.label}` };
    identity[field.key] = value;
  }
  if (!/^\d{5}-\d{7}-\d$/.test(String(input.cnic ?? "").trim())) {
    return { error: "CNIC must look like 12345-1234567-1." };
  }
  if (!isAtLeast18(identity.dob)) return { error: "Date of birth must be DD/MM/YYYY, and you must be at least 18." };
  if (!normalizeMobile(identity.mobile)) {
    return { error: "Mobile must be a Pakistan number, like 03XXXXXXXXX or +923XXXXXXXXX." };
  }
  identity.mobile = normalizeMobile(identity.mobile)!;
  if (!emailOk(identity.pemail) || !emailOk(identity.uemail)) {
    return { error: "Enter a valid personal email and a valid university email." };
  }
  if (!adult) return { error: "Confirm you are 18 or older, currently enrolled, and that your details are true." };
  return { identity, cnic: String(input.cnic).trim() };
}

export function namesMatch(typed: string, fullName: string) {
  return typed.trim().toLowerCase() === fullName.trim().toLowerCase();
}
