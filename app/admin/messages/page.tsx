import { Topbar } from "@/components/admin/Topbar";
import { MessagesPanel } from "@/components/admin/MessagesPanel";

export default function AdminMessagesPage() {
  return (
    <>
      <Topbar title="Messages" />
      <div className="space-y-5 p-4 sm:p-6">
        <MessagesPanel />
      </div>
    </>
  );
}
