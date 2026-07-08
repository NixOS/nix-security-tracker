import { useServerInfo } from "@/hooks/useServerInfo";

function Revision() {
  const serverInfo = useServerInfo();

  if (serverInfo) {
    const { production, revision } = serverInfo;
    const shortRev = revision.slice(0, 8);

    return (
      <p>
        Running revision{" "}
        {production ? (
          <a href={`https://github.com/NixOS/nix-security-tracker/commit/${revision}`}>
            {shortRev}
          </a>
        ) : (
          <span>{shortRev} (development)</span>
        )}
      </p>
    );
  } else {
    return null;
  }
}

export function Footer() {
  return (
    <footer className="bg-nixos-blue box spacious column gap text-white centered">
      <p>
        Nixpkgs security tracker is part of{" "}
        <a href="https://nixos.org/community/teams/security/">NixOS security infrastructure</a>.
      </p>
      <div className="row gap-big">
        <a href="https://github.com/NixOS/nix-security-tracker">Source code</a>
        <Revision />
      </div>
    </footer>
  );
}
