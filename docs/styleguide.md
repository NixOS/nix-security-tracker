# Style guide

This is a collection of patterns we would like to establish or preserve in the code.
It is based on recurring themes in reviews.

## Contribution culture

A pull request asks maintainers to accept responsibility for a decision.
Help them understand what they're agreeing to.

To minimise turnaround time for getting your contribution merged:

- Make exactly one change in each pull request.

  Don't lump together unrelated changes.
  Otherwise, easy parts that could be merged on their own get blocked by the harder ones that need multiple iterations to get right.

- Always add tests when changing behavior or fixing bugs.

  Ideally, start by adding tests.

  Even contributions that consist entirely of new tests annotated with `@pytest.mark.xfail(reason="Not implemented")` are welcome!
  This is a good way of formalising requirements to be implemented in the future.

- Use the commit message title to describe the change such that its merit can be evaluated.
  - Good: `fix: race condition during ingestion`
  - Bad: `fix: add with transaction.atomic() in ingestion.py`

- If the change is not trivial, explain _why_ the change is made in the pull request description and commit message.

  Also describe consequences of the change if they aren't obvious.

  Empty pull request descriptions and commit messages are fine if rationale and impact are evident from the title.

- Strive to keep the diff small.

  Larger changes typically mean that you made too many changes at once.
  Exceptions are mechanical changes that can be checked at a glance or reproduced by running a command.

- Don't rewrite history, address review comments in new commits.

  The pull request should still amount to a small change, and commits can be squashed before merging.

- [Run the tests](../CONTRIBUTING.md#running-tests) and [format the code](../CONTRIBUTING.md#formatting) before pushing.

- If you want to accept fixups by maintainers, [make your fork writeable](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork#enabling-repository-maintainer-permissions-on-existing-pull-requests).

  This allows for last-minute changes or resolving merge conflicts without your involvement.

## Code comments

- Comment sparingly.

  Only add comments if names in the code aren't sufficient to explain to readers proficient with Python what's going on and why it's needed.

- Don't mention code tokens in comments.
  - Bad: mentions the token directly

    ```
    # Increment `RetryCounter` on each update to `RemoteProcess`.
    ```

  - Good: describes the concept

    ```
    # Track how often the remote process was restarted.
    ```

  Code among prose, all displayed in the same monospace font, is hard to distinguish from the prose itself.
  And any markup would add noise that makes the prose harder to parse.

  Comments are for prose conveying ideas about high-level concepts.
  Call these concepts by their real-world names: CVE, package, suggestion, issue, ...

- Write [docstrings](https://docs.python.org/3/glossary.html#term-docstring) with opening and closing `"""` on their own lines.

  Example:

  ```python
  def foo():
     """
     This is a bit easier to read and work with.
     """
     pass
  ```

  Other than that, we're following [PEP 257](https://peps.python.org/pep-0257/).

- Write comments one line per sentence, just like documentation.

  Comment phrasing is changed once in a while, and rewrapping lines will make for noisy diffs.
  If lines get too long, write shorter sentences.

## Tagged comments

We use these tagged comments inspired by and loosely following [PEP 350](https://peps.python.org/pep-0350/#mnemonics):

- `TODO` - Unfinished change, should not occur in production

  We haven't adopted this pattern from the start, so there are still many `TODO`s that should be `FIXME`s.
  Please only replace instances when touching the respective code.

  ```
  # FIXME(@fricklerhandwerk): Remove the above note when the last instance of `TODO` is gone.
  ```

- `FIXME` - Known bad practice or hack, but too expensive or of questionable value to fix at the moment

  We use this to communicate to readers of the code where careful improvements are welcome, but weren't considered critical at the time of writing and thus won't be tracked as an issue.
  We only use issues to track desired changes to behavior observable by users.

- `NOTE` - Explanation for why unusual code is the way it is

  We use this to ask readers for extra attention to code that may be surprising but shouldn't be changed without particular care.

Always add your GitHub handle in parentheses -- `(@<author>)` -- so it's clear who had an opinion and may still have one during review.
Code may move around, so [`git blame`](https://git-scm.com/docs/git-blame) won't be useful to track comment authorship.
