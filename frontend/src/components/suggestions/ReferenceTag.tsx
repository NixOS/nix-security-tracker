type Props = {
  tag: string;
};

export function ReferenceTag({ tag }: Props) {
  return <div className="tag tag-gray">{tag}</div>;
}
