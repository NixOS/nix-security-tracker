{
  false_positive_ratio = {
    query = ''
      select coalesce(
        count(*) filter (where status = 'rejected')::double precision
        / nullif(count(*), 0),
        0
      ) as ratio
      from shared_cvederivationclusterproposal
      where status = 'published'
         or (
           status = 'rejected'
           and (rejection_reason is null or rejection_reason = 'not_in_nixpkgs')
         );
    '';
    values = [ "ratio" ];
  };
}
