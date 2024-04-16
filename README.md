# GenSpectrum dashboards

## Conventional Commits

This uses [Release Please](https://github.com/google-github-actions/release-please-action)
to generate releases for the components.
As Release Please relies on [Conventional Commits](https://www.conventionalcommits.org/) to determine the version,
commit messages should follow the Conventional Commits specification.

* Breaking changes must be indicated in the commit message.
  We prefer a footer that starts with `BREAKING CHANGE: ` followed by a description of the breaking change.
* Commits changing components code should use the scope `components`, e.g. `feat(components): add new component`.
* Release Please determines the commits that are relevant for the release by changed files.
  If you don't mean for a `feat` or `fix` commit to show up in the components change list,
  then you must not edit files in `components/` in the same commit.
