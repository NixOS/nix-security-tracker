import { UserIcon } from "lucide-preact";
import { useState } from "preact/hooks";

type AvatarProps = {
  avatarUrl?: string | null;
  username?: string;
  size: string;
};

export function Avatar({ avatarUrl, username, size }: AvatarProps) {
  // Used to display the placeholder before the avatar image is fully loaded
  const [loaded, setLoaded] = useState(false);
  const style = size ? { width: size, height: size } : undefined;

  if (!avatarUrl) {
    return <UserIcon className="circle" style={style} />;
  }

  return (
    <>
      {(!avatarUrl || !loaded) && <UserIcon className="circle" style={style} />}
      <img
        src={avatarUrl}
        alt={username}
        className="circle"
        style={{ ...style, display: loaded ? undefined : "none" }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
    </>
  );
}
