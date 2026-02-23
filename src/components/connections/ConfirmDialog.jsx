import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ action, onConfirm, onCancel }) {
  const isAccept = action === "accepted";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 ${isAccept ? "bg-green-50" : "bg-red-50"}`}>
          {isAccept
            ? <CheckCircle2 className="w-7 h-7 text-green-600" />
            : <XCircle className="w-7 h-7 text-red-500" />
          }
        </div>
        <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">
          {isAccept ? "Accept Connection?" : "Reject Connection?"}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {isAccept
            ? "Are you sure you want to connect with this buyer? They will be notified of your acceptance."
            : "Are you sure you want to reject this connection? This action cannot be undone."}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-full" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className={`flex-1 rounded-full text-white ${isAccept ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}
            onClick={onConfirm}
          >
            {isAccept ? "Yes, Accept" : "Yes, Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}