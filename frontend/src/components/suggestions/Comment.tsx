type Props = {
  comment: string;
};

export function Comment({ comment }: Props) {
  return (
    <textarea className="box rounded border monospace" disabled>
      {comment}
    </textarea>
  );
}
