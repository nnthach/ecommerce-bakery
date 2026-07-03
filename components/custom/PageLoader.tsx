import { Croissant } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-sand">
      <span className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-amber">
        <Croissant className="h-8 w-8 text-white" strokeWidth={1.5} />
      </span>
    </div>
  );
}
