import { readdir, readFile, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { parseDocument } from "yaml";

const root = process.cwd();
const skillsRoot = path.join(root, "skills");
const errors = [];
const execFileAsync = promisify(execFile);
const packageJson = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
const pluginJson = JSON.parse(
  await readFile(path.join(root, ".codex-plugin", "plugin.json"), "utf8"),
);
const sourceManifest = await readFile(
  path.join(root, "source_materials", "README.md"),
  "utf8",
);
const readme = await readFile(path.join(root, "README.md"), "utf8");
const installer = await readFile(
  path.join(root, "bin", "threejs-gamedev-mega-skills.mjs"),
  "utf8",
);
const researchThreeVersion = sourceManifest.match(/`three@(0\.\d+\.\d+)`/)?.[1];
const exampleVersions = new Set();

async function existsAsFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(entryPath));
    else files.push(entryPath);
  }
  return files;
}

function parseYaml(text, label) {
  const document = parseDocument(text, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });
  if (document.errors.length > 0) {
    for (const error of document.errors) {
      errors.push(`${label}: invalid YAML: ${error.message}`);
    }
    return null;
  }
  return document.toJS();
}

const skillNames = (await readdir(skillsRoot)).sort();
const routerText = await readFile(
  path.join(skillsRoot, "threejs-skill-router", "SKILL.md"),
  "utf8",
);

for (const skillName of skillNames) {
  const skillPath = path.join(skillsRoot, skillName);
  if (!(await stat(skillPath)).isDirectory()) continue;

  if (!/^[a-z0-9-]{1,63}$/.test(skillName)) {
    errors.push(`${skillName}: invalid directory name`);
  }

  const skillFile = path.join(skillPath, "SKILL.md");
  const yamlFile = path.join(skillPath, "agents", "openai.yaml");
  const skillText = await readFile(skillFile, "utf8");
  const yamlText = await readFile(yamlFile, "utf8");

  const frontmatter = skillText.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    errors.push(`${skillName}: missing YAML frontmatter`);
    continue;
  }

  const frontmatterData = parseYaml(frontmatter[1], `${skillName}/SKILL.md`);
  const frontmatterKeys = frontmatterData && typeof frontmatterData === "object"
    ? Object.keys(frontmatterData)
    : [];
  if (frontmatterKeys.join(",") !== "name,description") {
    errors.push(`${skillName}: frontmatter must contain only name, description`);
  }
  if (frontmatterData?.name !== skillName) {
    errors.push(`${skillName}: frontmatter name does not match directory`);
  }
  if (
    typeof frontmatterData?.description !== "string" ||
    frontmatterData.description.trim().length < 40
  ) {
    errors.push(`${skillName}: frontmatter description is missing or too weak`);
  }
  if (skillText.includes("[TODO")) {
    errors.push(`${skillName}: unresolved TODO placeholder`);
  }
  if (skillText.split("\n").length > 500) {
    errors.push(`${skillName}: SKILL.md exceeds 500 lines`);
  }
  const agentData = parseYaml(yamlText, `${skillName}/agents/openai.yaml`);
  const agentKeys = agentData && typeof agentData === "object"
    ? Object.keys(agentData)
    : [];
  if (agentKeys.join(",") !== "interface") {
    errors.push(`${skillName}: agents/openai.yaml must contain only interface`);
  }

  const interfaceData = agentData?.interface;
  const interfaceKeys = interfaceData && typeof interfaceData === "object"
    ? Object.keys(interfaceData)
    : [];
  if (
    interfaceKeys.join(",") !==
    "display_name,short_description,default_prompt"
  ) {
    errors.push(
      `${skillName}: interface must contain display_name, short_description, default_prompt`,
    );
  }
  const displayName = interfaceData?.display_name;
  const shortDescription = interfaceData?.short_description;
  const defaultPrompt = interfaceData?.default_prompt;
  if (typeof displayName !== "string" || displayName.trim().length === 0) {
    errors.push(`${skillName}: display_name must be a non-empty string`);
  }
  if (
    typeof shortDescription !== "string" ||
    shortDescription.length < 25 ||
    shortDescription.length > 64
  ) {
    errors.push(`${skillName}: short_description must be 25–64 characters`);
  }
  if (
    typeof defaultPrompt !== "string" ||
    !defaultPrompt.includes(`$${skillName}`)
  ) {
    errors.push(`${skillName}: default_prompt must mention $${skillName}`);
  }

  const referencesPath = path.join(skillPath, "references");
  const references = await readdir(referencesPath);
  if (references.filter((name) => name.endsWith(".md")).length === 0) {
    errors.push(`${skillName}: references directory is empty`);
  }
  for (const reference of references.filter((name) => name.endsWith(".md"))) {
    const relativeReference = `references/${reference}`;
    if (!skillText.includes(relativeReference)) {
      errors.push(`${skillName}: reference not linked from SKILL.md: ${relativeReference}`);
    }
  }

  for (const match of skillText.matchAll(/\]\((?!https?:|#)([^)#]+)(?:#[^)]+)?\)/g)) {
    const relativePath = decodeURIComponent(match[1]);
    if (!(await existsAsFile(path.join(skillPath, relativePath)))) {
      errors.push(`${skillName}: missing linked file ${relativePath}`);
    }
  }

  const examplesPath = path.join(skillPath, "examples");
  try {
    const exampleFiles = await collectFiles(examplesPath);
    for (const htmlPath of exampleFiles.filter((file) => file.endsWith("index.html"))) {
      const html = await readFile(htmlPath, "utf8");
      const relativeHtml = path.relative(skillPath, htmlPath);
      if (!skillText.includes(relativeHtml)) {
        errors.push(`${skillName}: example not linked from SKILL.md: ${relativeHtml}`);
      }
      if (!/three@0\.\d+\.\d+/.test(html)) {
        errors.push(`${skillName}: example must pin a Three.js version: ${relativeHtml}`);
      } else {
        exampleVersions.add(html.match(/three@(0\.\d+\.\d+)/)[1]);
      }
      if (!/src="\.\/main\.js"/.test(html)) {
        errors.push(`${skillName}: example must load ./main.js: ${relativeHtml}`);
      }
      const mainPath = path.join(path.dirname(htmlPath), "main.js");
      if (!(await existsAsFile(mainPath))) {
        errors.push(`${skillName}: example missing main.js: ${relativeHtml}`);
      } else {
        const main = await readFile(mainPath, "utf8");
        if (/\binner(?:Width|Height)\b/.test(main)) {
          errors.push(`${skillName}: example must size from its host, not innerWidth/innerHeight: ${relativeHtml}`);
        }
        if (/^(?!.*runtime\.listen).*addEventListener\(/m.test(main)) {
          errors.push(`${skillName}: example has an untracked event listener: ${relativeHtml}`);
        }
        if (!main.includes("lab-runtime.js")) {
          errors.push(`${skillName}: example must use the lifecycle harness: ${relativeHtml}`);
        }
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  if (skillName !== "threejs-skill-router" && !routerText.includes(`$${skillName}`)) {
    errors.push(`${skillName}: not reachable from threejs-skill-router`);
  }
}

if (packageJson.name !== "threejs-gamedev-mega-skills") {
  errors.push("package.json: unexpected package name");
}
if (packageJson.private === true) {
  errors.push("package.json: publishable package must not be private");
}
if (
  packageJson.bin?.["threejs-gamedev-mega-skills"] !==
  "bin/threejs-gamedev-mega-skills.mjs"
) {
  errors.push("package.json: installer bin entry is missing or noncanonical");
}
if (pluginJson.name !== packageJson.name) {
  errors.push("plugin.json: name must match package.json");
}
if (pluginJson.version !== packageJson.version) {
  errors.push("plugin.json: version must match package.json");
}
if (pluginJson.skills !== "./skills/") {
  errors.push("plugin.json: skills must point to ./skills/");
}
if (readme.includes("--skills") || installer.includes("--skills")) {
  errors.push("package: partial installation must not be documented or exposed");
}
if (!(await existsAsFile(path.join(root, "LICENSE")))) {
  errors.push("package: LICENSE is missing");
}
if (exampleVersions.size !== 1) {
  errors.push(`examples: expected one pinned Three.js version, found ${[...exampleVersions].join(", ")}`);
}
if (
  researchThreeVersion &&
  !exampleVersions.has(researchThreeVersion)
) {
  errors.push(
    `examples: pinned version must match research snapshot ${researchThreeVersion}`,
  );
}
if (
  !sourceManifest.includes("RenderPipeline") ||
  !sourceManifest.includes("deprecated in r183")
) {
  errors.push("source manifest: record the PostProcessing to RenderPipeline deprecation");
}

const skillMarkdownFiles = (await collectFiles(skillsRoot)).filter(
  (file) => file.endsWith(".md"),
);
const citedUrls = new Set();
for (const markdownFile of skillMarkdownFiles) {
  const markdown = await readFile(markdownFile, "utf8");
  for (const match of markdown.matchAll(/https:\/\/[^\s)]+/g)) {
    citedUrls.add(match[0]);
  }
}
for (const citedUrl of [...citedUrls].sort()) {
  if (!sourceManifest.includes(citedUrl)) {
    errors.push(`source manifest: undocumented skill source ${citedUrl}`);
  }
}

const syntaxRoots = [
  path.join(root, "bin"),
  path.join(root, "scripts"),
  path.join(root, "skills"),
];
for (const syntaxRoot of syntaxRoots) {
  const codeFiles = (await collectFiles(syntaxRoot)).filter(
    (file) => file.endsWith(".js") || file.endsWith(".mjs"),
  );
  for (const codeFile of codeFiles) {
    try {
      await execFileAsync(process.execPath, ["--check", codeFile]);
    } catch (error) {
      errors.push(
        `${path.relative(root, codeFile)}: JavaScript syntax error: ${error.stderr?.trim() ?? error.message}`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${skillNames.length} skills.`);
}
