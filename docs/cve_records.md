# CVE records

The tracker parses [CVE JSON 5.0](https://github.com/CVEProject/cve-schema) records from the [official CVE List](https://github.com/CVEProject/cvelistV5) and stores them in the database.
The schema follows the upstream format; see the [CVE record content rules](https://www.cve.org/ResourcesSupport/AllResources/CNARules#section_5_CVE_Record_Content) and the [schema reference](https://cveproject.github.io/cve-schema/schema/docs/) for field definitions.

Implementation of the data model: [`src/shared/models/cve.py`](../src/shared/models/cve.py).

A `CveRecord` has one or more `Container`s (CNA or ADP).
Matching mainly uses each container's `AffectedProduct` entries: vendor/product names, package names, CPE strings, and version constraints.

Implementation of automatic matching: [`src/shared/listeners/automatic_linkage.py`](../src/shared/listeners/automatic_linkage.py)
