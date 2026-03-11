"""Tests for the evaluation ingestion pipeline, especially meta.teams handling."""
import pytest

from shared.evaluation import fixup_evaluated_attribute


def _make_raw(meta: dict | None = None) -> dict:
    """Build a minimal raw attribute dict suitable for fixup_evaluated_attribute."""
    return {
        "attr": "foo",
        "attr_path": ["foo"],
        "name": "foo-1.0",
        "drv_path": "/nix/store/aaaa-foo-1.0.drv",
        "system": "x86_64-linux",
        "outputs": {"out": "/nix/store/bbbb-foo-1.0"},
        "meta": meta,
    }


def _alice() -> dict:
    return {"name": "Alice", "github": "alice", "githubId": 111, "email": "alice@example.com"}


def _bob() -> dict:
    return {"name": "Bob", "github": "bob", "githubId": 222, "email": "bob@example.com"}


def _team_with(members: list[dict], short_name: str = "myteam") -> dict:
    return {"shortName": short_name, "members": members}


# ---------------------------------------------------------------------------
# fixup_evaluated_attribute — meta.teams flattening
# ---------------------------------------------------------------------------


def test_only_meta_maintainers_unchanged():
    """Packages with only meta.maintainers are not affected."""
    raw = _make_raw(meta={"maintainers": [_alice()], "teams": []})
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    assert len(result.meta.maintainers) == 1
    assert result.meta.maintainers[0].github == "alice"


def test_only_meta_teams_becomes_maintainers():
    """A package whose maintainers live exclusively in meta.teams ends up with those members."""
    raw = _make_raw(meta={"maintainers": [], "teams": [_team_with([_bob()])]})
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    assert len(result.meta.maintainers) == 1
    assert result.meta.maintainers[0].github == "bob"


def test_meta_teams_without_meta_maintainers_field():
    """meta.maintainers absent entirely — only meta.teams present."""
    raw = _make_raw(meta={"teams": [_team_with([_bob()])]})
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    assert len(result.meta.maintainers) == 1
    assert result.meta.maintainers[0].github == "bob"


def test_meta_teams_with_null_meta_maintainers():
    """meta.maintainers is explicitly null — only meta.teams present."""
    raw = _make_raw(meta={"maintainers": None, "teams": [_team_with([_bob()])]})
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    assert len(result.meta.maintainers) == 1
    assert result.meta.maintainers[0].github == "bob"


def test_both_meta_maintainers_and_meta_teams_union():
    """Both meta.maintainers and meta.teams are present — result is the union."""
    raw = _make_raw(
        meta={"maintainers": [_alice()], "teams": [_team_with([_bob()])]}
    )
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    handles = {m.github for m in result.meta.maintainers}
    assert handles == {"alice", "bob"}


def test_deduplication_same_person_in_both():
    """A person in both meta.maintainers and a team's members appears only once."""
    raw = _make_raw(
        meta={"maintainers": [_alice()], "teams": [_team_with([_alice(), _bob()])]}
    )
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    handles = [m.github for m in result.meta.maintainers]
    # alice should appear exactly once despite being in both sources
    assert handles.count("alice") == 1
    assert "bob" in handles
    assert len(handles) == 2


def test_no_maintainers_no_teams_no_crash():
    """Packages with neither meta.maintainers nor meta.teams must not crash."""
    raw = _make_raw(meta={})
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    assert result.meta.maintainers == []


def test_no_meta_at_all_no_crash():
    """Packages with no meta block at all must not crash."""
    raw = _make_raw(meta=None)
    result = fixup_evaluated_attribute(raw)
    assert result.meta is None


def test_meta_teams_none_treated_as_empty():
    """meta.teams being null must not crash."""
    raw = _make_raw(meta={"maintainers": [_alice()], "teams": None})
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    assert len(result.meta.maintainers) == 1
    assert result.meta.maintainers[0].github == "alice"


def test_team_members_none_treated_as_empty():
    """A team whose members field is null must not crash."""
    raw = _make_raw(
        meta={"maintainers": [_alice()], "teams": [{"shortName": "ghost", "members": None}]}
    )
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    assert len(result.meta.maintainers) == 1
    assert result.meta.maintainers[0].github == "alice"


# Real production JSON from nix eval of `deployer` (pkgs/by-name/de/deployer/package.nix).
# The package declares ONLY meta.teams = [ lib.teams.php ], no meta.maintainers.
# This is the EXACT structure nixpkgs produces for meta.teams.
_DEPLOYER_TEAMS_JSON = [
    {
        "enableFeatureFreezePing": True,
        "github": "php",
        "githubId": 3806182,
        "githubMaintainers": [],
        "members": [
            {"email": "maximilian@mbosch.me", "github": "Ma27", "githubId": 6025220, "matrix": "@ma27:nicht-so.sexy", "name": "Maximilian Bosch"},
            {"email": "aaron@fosslib.net", "github": "aanderse", "githubId": 7755101, "matrix": "@aanderse:nixos.dev", "name": "Aaron Andersen"},
            {"email": "piokwiecinski+nixpkgs@gmail.com", "github": "piotrkwiecinski", "githubId": 2151333, "name": "Piotr Kwiecinski"},
            {"email": "kim.lindberger@gmail.com", "github": "talyz", "githubId": 63433, "matrix": "@talyz:matrix.org", "name": "Kim Lindberger"},
        ],
        "scope": "Maintain PHP related packages and extensions.",
        "shortName": "php",
    }
]

EXPECTED_DEPLOYER_GITHUB_HANDLES = {"Ma27", "aanderse", "piotrkwiecinski", "talyz"}


def test_deployer_team_only_maintainers_from_teams():
    """
    Integration test: real deployer package declares ONLY meta.teams (no meta.maintainers).

    The deployer package (pkgs/by-name/de/deployer/package.nix) has:
        meta.teams = [ lib.teams.php ];
    and does NOT set meta.maintainers.

    WITHOUT the fix (lines 148-168 in evaluation.py): fixup_evaluated_attribute never
    reads meta.teams, so output has 0 maintainers — team-maintained packages appear
    unmaintained and their maintainers receive no CVE notifications.

    WITH the fix: team members are flattened into meta.maintainers, so the package
    correctly has 4 maintainers (the PHP team members).
    """
    raw = _make_raw(meta={"teams": _DEPLOYER_TEAMS_JSON})
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    handles = {m.github for m in result.meta.maintainers}
    assert handles == EXPECTED_DEPLOYER_GITHUB_HANDLES, (
        f"Expected maintainers {EXPECTED_DEPLOYER_GITHUB_HANDLES}, got {handles}"
    )
    assert len(result.meta.maintainers) == 4


def test_multiple_teams_all_members_collected():
    """Members from multiple teams are all collected."""
    carol = {"name": "Carol", "github": "carol", "githubId": 333}
    raw = _make_raw(
        meta={
            "maintainers": [],
            "teams": [
                _team_with([_alice()], "team-a"),
                _team_with([_bob(), carol], "team-b"),
            ],
        }
    )
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    handles = {m.github for m in result.meta.maintainers}
    assert handles == {"alice", "bob", "carol"}


def test_team_member_without_github_id_added_by_fixup():
    """Members without a githubId are still added to meta.maintainers by fixup; parse_maintainers will skip them later."""
    no_id = {"name": "NoId", "github": "noid"}
    raw = _make_raw(meta={"teams": [_team_with([no_id])]})
    result = fixup_evaluated_attribute(raw)
    assert result.meta is not None
    assert len(result.meta.maintainers) == 1
    assert result.meta.maintainers[0].github == "noid"


@pytest.mark.django_db
def test_parse_maintainers_skips_no_github_id(db):
    """parse_maintainers skips entries without a github_id, even if github handle is present."""
    from shared.evaluation import MaintainerAttribute, SyncBatchAttributeIngester
    from shared.models.nix_evaluation import NixChannel, NixEvaluation

    channel = NixChannel.objects.create(
        staging_branch="nixos-24.11",
        channel_branch="nixos-24.11",
        head_sha1_commit="abc123",
        state=NixChannel.ChannelState.STABLE,
        release_version="24.11",
        repository="https://github.com/NixOS/nixpkgs",
    )
    evaluation = NixEvaluation.objects.create(
        channel=channel,
        commit_sha1="def456",
        state=NixEvaluation.EvaluationState.COMPLETED,
    )
    ingester = SyncBatchAttributeIngester([], evaluation)
    ingester.initialize()

    # Member with no github_id should be skipped
    no_id = MaintainerAttribute(name="NoId", github="noid", github_id=None)
    with_id = MaintainerAttribute(name="WithId", github="withid", github_id=999)
    result = ingester.parse_maintainers([no_id, with_id])
    assert len(result) == 1
    assert result[0].github == "withid"
