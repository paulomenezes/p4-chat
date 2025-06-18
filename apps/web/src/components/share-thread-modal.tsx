import { useState } from 'react';
import { ShareIcon, SendIcon, XIcon } from 'lucide-react';
import { TagInput } from 'emblor';
import type { Tag } from 'emblor';
import type { Doc, Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useSessionId } from 'convex-helpers/react/sessions';
import { toast } from 'sonner';

interface ShareThreadModalProps {
  thread: Doc<'threads'>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareThreadModal({ thread, isOpen, onOpenChange }: ShareThreadModalProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [sessionId] = useSessionId();
  const shareThread = useMutation(api.threads.share);
  const removeShare = useMutation(api.threads.removeShare);
  const shares = useQuery(api.threads.getShares, sessionId ? { threadId: thread._id, sessionId } : 'skip');

  function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Handle tag addition with validation
  function handleSetTags(newTags: Tag[] | ((prevTags: Tag[]) => Tag[])) {
    const tagsArray = typeof newTags === 'function' ? newTags(tags) : newTags;
    const validTags = tagsArray.filter((tag) => isValidEmail(tag.text));
    setTags(validTags);
  }

  async function handleShare() {
    if (tags.length === 0 || !sessionId) {
      return;
    }

    setIsSharing(true);

    try {
      const emails = tags.map((tag) => tag.text);

      toast.promise(
        shareThread({
          threadId: thread._id,
          emails,
          message,
          sessionId,
        }),
        {
          loading: 'Sharing thread...',
          success: 'Thread shared successfully',
          error: 'Failed to share thread',
        },
      );

      onOpenChange(false);
      setTags([]);
      setMessage('');
    } catch (error) {
      console.error('Failed to share thread:', error);
    } finally {
      setIsSharing(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
    setTags([]);
    setMessage('');
  }

  function handleRemoveShare(shareId: Id<'threadShares'>) {
    if (!sessionId) {
      return;
    }

    toast.promise(removeShare({ id: shareId, sessionId }), {
      loading: 'Removing share...',
      success: 'Share removed successfully',
      error: 'Failed to remove share',
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShareIcon className="size-5" />
            Share Thread
          </DialogTitle>
          <DialogDescription>
            Share "{thread.title}" with others via email. They will receive a link to view this conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {shares && shares.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="shares">Shared with</Label>

              <div className="flex flex-row flex-wrap gap-1">
                {shares?.map((share) => (
                  <div
                    key={share._id}
                    className="flex items-center justify-between gap-2 rounded-md border p-1 pl-2 bg-primary-foreground/50 text-xs"
                  >
                    <p>{share.email}</p>
                    <Button variant="ghost" size="xs" onClick={() => handleRemoveShare(share._id)}>
                      <XIcon className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="emails">Email Addresses</Label>
            <TagInput
              id="emails"
              placeholder="Enter email addresses"
              tags={tags}
              setTags={handleSetTags}
              activeTagIndex={activeTagIndex}
              setActiveTagIndex={setActiveTagIndex}
              styleClasses={{
                input: 'h-8 shadow-none',
              }}
              addTagsOnBlur
            />

            <p className="text-xs text-muted-foreground">Press Enter or comma to add email addresses</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSharing}>
            <XIcon className="mr-2 size-4" />
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={tags.length === 0 || isSharing}>
            <SendIcon className="mr-2 size-4" />
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
