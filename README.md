# Nixpkgs security tracker

The **Nixpkgs security tracker** is a web service for managing information on vulnerabilities in software distributed through Nixpkgs.

It is deployed at <https://tracker.security.nixos.org>.

The tool serves three audiences:

- **NixOS security team**: review incoming CVEs and link them to affected packages
- **Nixpkgs maintainers**: get notified when their packages have vulnerabilities
- **Nixpkgs users**: subscribe to notifications for packages they care about

## Contributing

Please see the [contributing guide](CONTRIBUTING.md) for more information on how to get started.

## History

- **2023**

  The prototype was funded through the [Sovereign Tech Fund "Contribute Back Challenge" 2023](https://www.sovereign.tech/news/contribute-back-challenges-participants-selected) investment, after a [successful application](https://discourse.nixos.org/t/nixpkgs-supply-chain-security-project/34345) with a [proposal to strengthen NixOS security infrastructure](https://github.com/nix-community/projects/blob/274c6d15708b8f0f6e0b3f9782e3959e076ff792/proposals/nixpkgs-security.md).

- **2024**

  Production deployment got delayed due to technical and organisational challenges, with slow progress on volunteered time past the original schedule.

  [Remaining work was picked up end of the year](https://discourse.nixos.org/t/nixpkgs-supply-chain-security-project/34345/22), and concluded with a [demo to the NixOS security team](https://discourse.nixos.org/t/nixpkgs-supply-chain-security-project/34345/27).

- **2025**

  Continued development of the Nixpkgs security tracker funded via [Tweag](https://www.tweag.io/), as part of a larger effort to improve robustness of the Nix ecosystem.

  The [NixOS security team](https://nixos.org/community/teams/security/) started productive use, publishing and addressing numerous [security issues](https://github.com/NixOS/nixpkgs/issues?q=is%3Aissue%20state%3Aopen%20label%3A%221.severity%3A%20security%22%20author%3Aapp%2Fnixpkgs-security-tracker).

## Acknowledgements

This contribution to critical IT infrastructure would not be possible without the financial support of:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/supporters/SovereignTechAgency-white.svg">
  <source media="(prefers-color-scheme: light)" srcset="./docs/supporters/SovereignTechAgency-black.svg">
  <img alt="Sovereign Tech Agency" style="width: 10rem;" src="./docs/supporters/SovereignTechAgency-black.svg">
</picture>
