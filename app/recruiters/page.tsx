import { redirect } from "next/navigation";

/** Old recruiter URL — keep one landing page at `/`. */
export default function RecruiterLandingRedirect() {
  redirect("/#audiences");
}
