import { Card } from "@/components/ui/card";
import { StepNav } from "@/components/step-nav";
import { Watermark } from "@/components/watermark";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Watermark />
      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-6 md:grid-cols-[230px_1fr]">
        <StepNav />
        <Card className="min-w-0 p-6" id="main">
          {children}
        </Card>
      </div>
    </>
  );
}
