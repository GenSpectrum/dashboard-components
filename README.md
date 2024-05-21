# GenSpectrum dashboards

## Conventional Commits

This uses [Release Please](https://github.com/google-github-actions/release-please-action)
to generate releases for the components.
As Release Please relies on [Conventional Commits](https://www.conventionalcommits.org/) to determine the version,
commit messages should follow the Conventional Commits specification.

* The most important prefixes that affect new versions are `feat:` (new minor version) and `fix:` (new patch version).
* Breaking changes must be indicated in the commit message.
  We prefer a footer that starts with `BREAKING CHANGE: ` followed by a description of the breaking change.
  This will result in a new major version.
* Commits changing components code should use the scope `components`, e.g. `feat(components): add new component`.
* Release Please determines the commits that are relevant for the release by changed files.
  If you don't mean for a `feat` or `fix` commit to show up in the components change list,
  then you must not edit files in `components/` in the same commit.
* 
### Testing The Generated Changelog

To test the generated changelog, run

```shell
npm run release-please-dry-run -- --token=<GitHub PAT> --target-branch=<name of the upstream branch>
```

where
* `<GitHub PAT>` is a GitHub Personal Access Token. It doesn't need any permissions.
* `<name of the upstream branch>` is the name of the branch for which the changelog should be generated.

__NOTE: This command does not respect local changes. It will pull the commit messages from the remote repository.__
