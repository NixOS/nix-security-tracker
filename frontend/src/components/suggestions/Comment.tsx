import { useEffect, useRef, useState } from "preact/hooks";
import { useCommentMutation } from "@/hooks/useComment";
import styles from "./Comment.module.css";

type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

type Props = {
  suggestionId: number;
  comment: string | null;
  canEdit: boolean;
};

const DEBOUNCE_SAVE_MS = 500;
const DEBOUNCE_CLEAR_SAVED_FEEDBACK_MS = 2000;

export function Comment({ suggestionId, comment, canEdit }: Props) {
  const [value, setValue] = useState(comment ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useCommentMutation(suggestionId);

  // Sync if the prop changes externally (e.g. parent re-fetches)
  useEffect(() => {
    setValue(comment ?? "");
  }, [comment]);

  function handleChange(e: Event) {
    const next = (e.target as HTMLTextAreaElement).value;
    setValue(next);
    setSaveState("pending");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);

    debounceRef.current = setTimeout(() => {
      setSaveState("saving");
      mutation.mutate(
        { id: suggestionId, data: { comment: next } },
        {
          onSuccess: () => {
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
      className={`box rounded border monospace ${styles.textarea} ${stateClass}`}
      value={value}
      onInput={handleChange}
      placeholder="Free comment: context, additional info, dismissal reason, etc."
      disabled={!canEdit}
      maxLength={1000}
      data-save-state={saveState}
    />
  );
}
