import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import oxlint from "eslint-plugin-oxlint";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
];

export default eslintConfig;
