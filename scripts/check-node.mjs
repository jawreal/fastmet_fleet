const minimumMajor = 24;
const firstUnsupportedMajor = 27;
const detectedVersion = process.versions.node;
const major = Number(detectedVersion.split(".")[0]);

if (
  major < minimumMajor ||
  major >= firstUnsupportedMajor ||
  detectedVersion.includes("-")
) {
  console.error(
    `FastMet Fleet requires Node.js ${minimumMajor}.0.0 or newer and below ${firstUnsupportedMajor}.0.0 (stable releases only). Detected ${detectedVersion}. Run nvm use to select the recommended version.`,
  );
  process.exitCode = 1;
}
