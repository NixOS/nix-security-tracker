# Design documents

This directory is a collection of design notes on how the Nixpkgs security tracker should work.

## Why matching needs manual triage

CVE records describe upstream software by vendor names, product names, and CPE strings.
Nixpkgs identifies packages by attribute paths and derivation names.
Those naming schemes rarely align one-to-one, and version information in CVE data is often incomplete or imprecise.

The tracker proposes links automatically, but a human must verify each match, ignore irrelevant packages, and publish an issue when Nixpkgs is actually affected.

## Documents

- [Record linkage design](./01_linkage.md)
- [CPE-based linkage design](./02_cpe-based_linkage.md)
