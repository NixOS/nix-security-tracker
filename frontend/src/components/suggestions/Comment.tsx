import { useEffect, useRef, useState } from "preact/hooks";
import { useCommentMutation } from "@/hooks/useComment";
import styles from "./Comment.module.css";

type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

type Props = {
  suggestionId: number;
  comment: string | null;
  canEdit: boolean;
  compact?: boolean;
};

const DEBOUNCE_SAVE_MS = 500;
const DEBOUNCE_CLEAR_SAVED_FEEDBACK_MS = 2000;

export function Comment({ suggestionId, comment, canEdit, compact = false }: Props) {
  const [value, setValue] = useState(comment ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Unsaved local edits: the box must not be overwritten by anything coming from the server.
  const dirtyRef = useRef(false);
  // Latest typed text, readable from the mutation callbacks.
  const valueRef = useRef(value);

  const mutation = useCommentMutation(suggestionId);

  // Adopt an external value (parent re-fetch, own save echo) only when there is nothing unsaved locally.
  // Otherwise it would clobber what the user is typing.
  useEffect(() => {
    if (dirtyRef.current) return;
    setValue(comment ?? "");
    valueRef.current = comment ?? "";
  }, [comment]);

  function handleChange(e: Event) {
    const next = (e.target as HTMLTextAreaElement).value;
    setValue(next);
    valueRef.current = next;
    dirtyRef.current = true;
    setSaveState("pending");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);

    debounceRef.current = setTimeout(() => {
      setSaveState("saving");
      mutation.mutate(
        { id: suggestionId, data: { comment: next } },
        {
          onSuccess: () => {
            // Only settle if nothing was typed since: otherwise another save is pending.
            if (valueRef.current !== next) return;
            dirtyRef.current = false;
            setSaveState("saved");
            savedTimeoutRef.current = setTimeout(
              () => setSaveState("idle"),
              DEBOUNCE_CLEAR_SAVED_FEEDBACK_MS,
            );
          },
          onError: () => {
            setSaveState("error");
          },
        },
      );
    }, DEBOUNCE_SAVE_MS);
  }

  const stateClass = styles[saveState];

  return (
    <textarea
      className={`box rounded border monospace ${styles.textarea} ${compact && "compact"} ${compact ? styles.compact : ""} ${stateClass}`}
      value={value}
      onInput={handleChange}
      placeholder={
        compact ? "Comment…" : "Free comment: context, additional info, dismissal reason, etc."
      }
      disabled={!canEdit}
      maxLength={1000}
      data-save-state={saveState}
      rows={compact ? 1 : 3}
    />
  );
}
