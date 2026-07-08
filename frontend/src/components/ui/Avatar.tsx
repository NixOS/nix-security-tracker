import { UserIcon } from "lucide-preact";

type AvatarProps = {
  avatarUrl?: string | null;
  username?: string;
  size?: string;
};

export function Avatar({ avatarUrl, username, size = "2em" }: AvatarProps) {
  const style = size ? { width: size, height: size } : undefined;
  return avatarUrl ? (
    <img src={avatarUrl} alt={username ?? "avatar"} className="circle" style={style} />
  ) : (
    <UserIcon className="circle" style={style} />
  );
}
