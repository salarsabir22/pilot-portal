import { StepNav } from "@/components/step-nav";
import { Watermark } from "@/components/watermark";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Watermark />
      <div className="wrap">
        <StepNav />
        <main className="card" id="main">
          {children}
        </main>
      </div>
    </>
  );
}
