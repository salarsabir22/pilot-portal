import { Card } from "@/components/ui/card";
import { StepNav } from "@/components/step-nav";
import { Watermark } from "@/components/watermark";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Watermark />
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-[220px_1fr] md:py-14">
        <StepNav />
        <Card className="min-w-0 space-y-6 p-6 sm:p-10" id="main">
          {children}
        </Card>
      </div>
    </>
  );
}
