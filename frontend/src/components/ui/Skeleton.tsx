import { cx } from "@/utils/className";

type SkeletonProps = {
  width: string;
  height: string;
  shape?: "rect" | "circle";
  className?: string;
};

export function Skeleton({ width, height, shape = "rect", className = "" }: SkeletonProps) {
  return (
    <div
      className={cx("loading", shape === "circle" ? "circle" : "rounded", className)}
      style={{
        width,
        height,
      }}
      aria-hidden="true"
    />
  );
}
