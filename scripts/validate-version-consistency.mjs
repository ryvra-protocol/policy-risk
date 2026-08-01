import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, "package.json");

const errors = [];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isSemver(version) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version);
}

function isPolicyVersion(value) {
  return /^v\d+(?:\.\d+){0,2}$/.test(value);
}

const pkg = readJson(packageJsonPath);

if (pkg.packageManager !== "pnpm@10.16.0") {
  errors.push(`packageManager must be pnpm@10.16.0, found: ${pkg.packageManager ?? "<missing>"}`);
}

if (typeof pkg.name !== "string" || pkg.name.trim().length === 0) {
  errors.push("package.json name must be a non-empty string");
}

if (typeof pkg.version !== "string" || !isSemver(pkg.version)) {
  errors.push(`package.json version must be semver, found: ${pkg.version ?? "<missing>"}`);
}

const artifactFiles = [
  path.join(repoRoot, "src", "engine", "policy-engine.ts"),
  path.join(repoRoot, "test", "policy-engine.spec.ts"),
  path.join(repoRoot, "test", "policy-decision-output.spec.ts")
];

for (const filePath of artifactFiles) {
  const content = fs.readFileSync(filePath, "utf8");

  const policyVersionMatches = [...content.matchAll(/policyVersion:\s*"([^"]+)"/g)];
  const policyVersionFieldMatches = [...content.matchAll(/policy_version:\s*"([^"]+)"/g)];

  for (const match of [...policyVersionMatches, ...policyVersionFieldMatches]) {
    const found = match[1];
    if (!isPolicyVersion(found)) {
      const relPath = path.relative(repoRoot, filePath);
      errors.push(`${relPath} has invalid policy version format: ${found}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Version consistency validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Version consistency validation passed.");
