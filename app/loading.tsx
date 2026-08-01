import { Loader } from "@/components/Loader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream-200">
      <div className="app-shell grid min-h-screen place-items-center">
        <Loader />
      </div>
    </div>
  );
}
