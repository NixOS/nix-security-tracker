type SkeletonProps = {
  width: string;
  height: string;
  shape?: "rect" | "circle";
  className?: string;
};

export function Skeleton({ width, height, shape = "rect", className = "" }: SkeletonProps) {
  return (
    <div
      className={["loading", shape === "circle" ? "circle" : "rounded", className]
        .filter(Boolean)
        .join(" ")}
      style={{
        width,
        height,
      }}
      aria-hidden="true"
    />
  );
}
