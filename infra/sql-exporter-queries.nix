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
}
