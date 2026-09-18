import { LayersIcon, MoveDownIcon, UserCogIcon, UserIcon, UserShieldIcon } from "lucide-preact";
import { Link } from "wouter-preact";
import { SuggestionStatusIcon } from "@/components/suggestions/SuggestionStatusIcon";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function Home() {
  return (
    <div className="column gap-big">
      <div className="column gap">
        <h1 className="text-xl bold">Nixpkgs security tracker</h1>
        <p>
          The <strong className="bold">Nixpkgs security tracker</strong> is a web service for
          managing information on vulnerabilities in software distributed through{" "}
          <ExternalLink href="https://github.com/NixOS/nixpkgs">Nixpkgs</ExternalLink> and{" "}
          <ExternalLink href="https://nixos.org/">NixOS</ExternalLink>.
        </p>
        <p>
          It is intended to help with solving the{" "}
          <ExternalLink href="https://en.wikipedia.org/wiki/Record_linkage">
            record linkage
          </ExternalLink>{" "}
          problem of matching packages in the{" "}
          <ExternalLink href="https://www.cve.org/">CVE database</ExternalLink> and{" "}
          <ExternalLink href="https://search.nixos.org/packages">Nixpkgs</ExternalLink>.
        </p>
      </div>
      <h2 className="text-l bold">Workflow</h2>
      <div className="column centered gap-small">
        <div className="row gap-big centered">
          <div className="column centered gap-small">
            <img src="/static/cveLogo.svg" alt="" aria-hidden="true" style="height: 3em" />
            <ExternalLink href="https://www.cve.org/ResourcesSupport/Glossary#glossaryRecord">
              CVE Records
            </ExternalLink>
            <MoveDownIcon strokeWidth={0.8} size="2em" />
          </div>
          <div className="column centered gap-small">
            <img src="/static/nixpkgsLogo.svg" alt="" aria-hidden="true" style="height: 3em" />
            <ExternalLink href="https://search.nixos.org/packages">
              Nixpkgs derivations
            </ExternalLink>
            <MoveDownIcon strokeWidth={0.8} size="2em" />
          </div>
        </div>
        <div className="column centered">
          <div>Security tracker matching algorithm</div>
          <div>1 CVE • Several packages</div>
        </div>
        <MoveDownIcon strokeWidth={0.8} size="2em" />
        <Link
          href="/ui-v2/suggestions?status=pending"
          className="box rounded border row gap-small centered justify-center"
          style="min-width: 20em"
        >
          <SuggestionStatusIcon status="pending" size="1em" />
          Untriaged suggestions
        </Link>
        <div className="row gap-big">
          <div className="column gap-small centered" style="width: 15em">
            <MoveDownIcon strokeWidth={0.8} size="2em" />
            <div>Team rejects</div>
            <MoveDownIcon strokeWidth={0.8} size="2em" />
            <Link
              href="/ui-v2/suggestions?status=rejected"
              className="box rounded border row gap-small centered"
            >
              <SuggestionStatusIcon status="rejected" size="1em" />
              Dismissed suggestions
            </Link>
            <div>CVEs that already were classified by a human as not affecting Nixpkgs</div>
          </div>
          <div className="column gap-small centered" style="width: 15em">
            <MoveDownIcon strokeWidth={0.8} size="2em" />
            <div>Team accepts</div>
            <MoveDownIcon strokeWidth={0.8} size="2em" />
            <Link
              href="/ui-v2/suggestions?status=accepted"
              className="box rounded border row gap-small centered"
            >
              <SuggestionStatusIcon status="accepted" size="1em" />
              Accepted suggestions
            </Link>
            <div>May need further refinement</div>
            <MoveDownIcon strokeWidth={0.8} size="2em" />
            <div className="column centered">
              <div>Manual tuning</div>
            </div>
            <MoveDownIcon strokeWidth={0.8} size="2em" />
            <div>Bundle related suggestions</div>
            <MoveDownIcon strokeWidth={0.8} size="2em" />
            <Link
              href="/ui-v2/suggestions?in_issue_draft=true"
              className="box rounded border row gap-small centered"
            >
              <LayersIcon size="1em" />
              Issue draft
            </Link>
            <div>CVEs that users have bundled together for the next GitHub issue</div>
            <MoveDownIcon strokeWidth={0.8} size="2em" />
            <Link
              href="http://localhost:8000/ui-v2/issues"
              className="box rounded border row gap-small centered"
            >
              <SuggestionStatusIcon status="published" size="1em" />
              Nixpkgs issues
            </Link>
            <div>
              Have a persistent identifier and link to{" "}
              <ExternalLink href="https://github.com/Nix-Security-WG/sectracker-testing/issues?q=is%3Aissue+state%3Aopen">
                GitHub issues
              </ExternalLink>
              , where maintainers are notified and mitigation is coordinated
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-l bold">Contributors and users</h2>
      <div className="row gap-big wrap justify-center">
        <div className="column gap centered" style="flex-basis: 15em">
          <UserShieldIcon size="2em" />
          <p>
            <ExternalLink href="https://github.com/NixOS/nixpkgs-committers/">
              Nixpkgs committers
            </ExternalLink>{" "}
            can edit suggestions to help the NixOS security team with triaging.
          </p>
        </div>
        <div className="column gap centered" style="flex-basis: 15em">
          <UserCogIcon size="2em" />
          <p>
            <ExternalLink href="https://github.com/orgs/nixos/teams/nixpkgs-maintainers">
              Nixpkgs maintainers
            </ExternalLink>{" "}
            are encouraged to check their notifications.
          </p>
        </div>
        <div className="column gap centered" style="flex-basis: 15em">
          <UserIcon size="2em" />
          <p>
            If you use NixOS or otherwise rely on software from Nixpkgs,{" "}
            <Link href="/user/subscriptions">subscribe to notifications</Link> on published
            vulnerabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
