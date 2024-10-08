import {RuleConfigSeverity} from "@commitlint/types";

/**
 * @type {import('@commitlint/types').UserConfig}
 */
const Configuration = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        "scope-empty": [RuleConfigSeverity.Error, "never"],
        "scope-enum": [
            RuleConfigSeverity.Error,
            "always",
            [
                "components",
                "examples",
                "github-actions",
                "root", // used by dependabot to update the root package.json
            ]
        ],
        "body-max-line-length": [RuleConfigSeverity.Disabled],
        "header-max-length": [RuleConfigSeverity.Error, "always", 200],
        "footer-max-line-length": [RuleConfigSeverity.Error, "always", 200],
    }
};

export default Configuration;
