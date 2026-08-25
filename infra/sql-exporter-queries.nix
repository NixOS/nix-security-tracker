{
  users = {
    query = "select count(*) from auth_user;";
    values = [ "count" ];
  };
  delta = {
    query = "select extract(EPOCH from timestamp) AS unix_timestamp from shared_cveingestion where delta = 't' order by timestamp desc limit 1;";
    values = [ "unix_timestamp" ];
  };
  matching = {
    query = "select extract(EPOCH from created_at) AS unix_timestamp from shared_cvederivationclusterproposal order by created_at desc limit 1;";
    values = [ "unix_timestamp" ];
  };
  cves = {
    query = "select count(*) from shared_cverecord where state='PUBLISHED';";
    values = [ "count" ];
  };
  derivations = {
    query = "select count(*) from shared_nixderivation;";
    values = [ "count" ];
  };
  evaluations = {
    query = "select count(*) from shared_nixevaluation;";
    values = [ "count" ];
  };
  issues = {
    query = "select count(*) from shared_nixpkgsissue;";
    values = [ "count" ];
  };
  suggestions = {
    query = "select count(*) from shared_cvederivationclusterproposal;";
    values = [ "count" ];
  };
  suggestions_pending = {
    query = "select count(*) from shared_cvederivationclusterproposal where status='pending';";
    values = [ "count" ];
  };
  suggestions_rejected = {
    query = "select count(*) from shared_cvederivationclusterproposal where status='rejected';";
    values = [ "count" ];
  };
  suggestions_accepted = {
    query = "select count(*) from shared_cvederivationclusterproposal where status='accepted';";
    values = [ "count" ];
  };
  # this should be the same as `issues` above, but adding a single metric
  # with low cardinality is very cheap so let's add it for completeness
  suggestions_published = {
    query = "select count(*) from shared_cvederivationclusterproposal where status='published';";
    values = [ "count" ];
  };
  channel_evaluation_status = {
    help = "Per-channel latest and latest-successful Nix evaluation status";
    labels = [
      "channel"
    ];
    values = [
      "latest_state"
      "latest_updated"
      "latest_elapsed"
      "latest_successful_updated"
      "latest_successful_at_head"
    ];
    query = "
            WITH latest AS (
              SELECT DISTINCT ON (channel_id)
                channel_id, state, commit_sha1, updated_at, elapsed
              FROM shared_nixevaluation
              ORDER BY channel_id, updated_at DESC
            ),
            latest_successful AS (
              SELECT DISTINCT ON (channel_id)
                channel_id, commit_sha1, updated_at
              FROM shared_nixevaluation
              WHERE state = 'COMPLETED'
              ORDER BY channel_id, updated_at DESC
            )
            SELECT
              c.channel_branch::text AS channel,
              CASE l.state
                WHEN 'WAITING' THEN 1
                WHEN 'IN_PROGRESS' THEN 2
                WHEN 'COMPLETED' THEN 3
                WHEN 'CRASHED' THEN 4
                WHEN 'FAILED' THEN 5
                ELSE 0
              END::float AS latest_state,
              CASE
                WHEN l.updated_at IS NULL THEN NULL
                ELSE extract(epoch FROM l.updated_at) * 1000
              END::float AS latest_updated,
              CASE
                WHEN l.state IS NULL OR l.state = '' THEN NULL
                WHEN l.state IN ('COMPLETED', 'CRASHED', 'FAILED') THEN COALESCE(l.elapsed, 0)
                ELSE EXTRACT(EPOCH FROM (now() - l.updated_at))::float
              END AS latest_elapsed,
              CASE
                WHEN s.updated_at IS NULL THEN NULL
                ELSE extract(epoch FROM s.updated_at) * 1000
              END::float AS latest_successful_updated,
              CASE WHEN s.commit_sha1 IS NOT NULL AND s.commit_sha1 = c.head_sha1_commit THEN 1 ELSE 0 END::float AS latest_successful_at_head
            FROM shared_nixchannel c
            LEFT JOIN latest l ON l.channel_id = c.channel_branch
            LEFT JOIN latest_successful s ON s.channel_id = c.channel_branch
            WHERE c.state IN ('deprecated', 'beta', 'stable', 'rolling')
            ORDER BY c.channel_branch
          ";
  };
}
