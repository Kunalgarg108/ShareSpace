import { DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";

export default function FullScreenDialogContent({ children }) {
  return (
    <DialogContent className="fixed inset-0 z-50 flex flex-col bg-black p-0 overflow-y-auto">
      <VisuallyHidden>
        <DialogTitle>Post Details</DialogTitle>
      </VisuallyHidden>
      <DialogClose className="absolute top-4 right-4 text-white z-50">
        <X className="w-6 h-6" />
      </DialogClose>
      <div className="flex-1">{children}</div>
    </DialogContent>
  );
}
