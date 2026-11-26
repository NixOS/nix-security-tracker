from django.db import migrations, models

# Keep the first of duplicate links, with the flags of all of them.
MERGE_DUPLICATES = """
WITH duplicates AS (
    SELECT proposal_id, derivation_id, min(id) AS keep, bit_or(provenance_flags) AS flags
    FROM shared_derivationclusterproposallink
    GROUP BY proposal_id, derivation_id
    HAVING count(*) > 1
), merged AS (
    UPDATE shared_derivationclusterproposallink link
    SET provenance_flags = duplicates.flags
    FROM duplicates
    WHERE link.id = duplicates.keep
)
DELETE FROM shared_derivationclusterproposallink link
USING duplicates
WHERE link.proposal_id = duplicates.proposal_id
    AND link.derivation_id = duplicates.derivation_id
    AND link.id <> duplicates.keep;
"""


class Migration(migrations.Migration):
    dependencies = [
        ("shared", "0114_name_and_cpe_candidate_indexes"),
    ]

    operations = [
        migrations.RunSQL(MERGE_DUPLICATES, migrations.RunSQL.noop),
        migrations.AddConstraint(
            model_name="derivationclusterproposallink",
            constraint=models.UniqueConstraint(
                fields=("proposal", "derivation"), name="unique_derivation_per_proposal"
            ),
        ),
    ]
