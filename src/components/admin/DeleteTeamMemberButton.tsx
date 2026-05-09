
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function DeleteTeamMemberButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Team member deleted successfully.');
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Delete failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/5 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-[#07111f] text-white">
          <DialogHeader>
            <DialogTitle>Delete Team Member?</DialogTitle>
            <DialogDescription className="text-dark-muted">
              This will permanently remove <span className="text-white font-semibold">&quot;{name}&quot;</span> from the about page. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setOpen(false)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-dark-muted hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {busy ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}