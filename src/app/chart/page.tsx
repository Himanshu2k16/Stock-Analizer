import { Suspense } from "react";
import { ChartView } from "@/modules/market";

export default function ChartPage() {
  return (
    <Suspense
      fallback={
        <div className="grid h-screen place-items-center bg-ink-950">
          <p className="label-mono">Loading chart…</p>
        </div>
      }
    >
      <ChartView />
    </Suspense>
  );
}
