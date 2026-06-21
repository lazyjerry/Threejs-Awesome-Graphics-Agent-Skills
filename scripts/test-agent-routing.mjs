import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const skillsRoot = path.join(root, "skills");
const router = await readFile(
  path.join(skillsRoot, "threejs-skill-router", "SKILL.md"),
  "utf8",
);
const fixtures = JSON.parse(
  await readFile(
    path.join(root, "source_materials", "agent-routing-cases.json"),
    "utf8",
  ),
);

assert.equal(fixtures.schemaVersion, 1, "unsupported routing fixture schema");

const skillNames = (await readdir(skillsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const atomicSkills = skillNames.filter(
  (skill) => skill !== "threejs-skill-router",
);

const routeRows = new Map();
for (const line of router.split("\n")) {
  const match = line.match(/^\|\s*(.+?)\s*\|\s*`\$(threejs-[a-z0-9-]+)`\s*\|$/);
  if (!match) continue;
  assert.ok(!routeRows.has(match[2]), `duplicate router row for ${match[2]}`);
  routeRows.set(match[2], match[1].toLowerCase());
}

assert.deepEqual(
  [...routeRows.keys()].sort(),
  atomicSkills,
  "router table must contain every atomic skill exactly once",
);

for (const fixture of fixtures.cases) {
  assert.ok(
    typeof fixture.request === "string" && fixture.request.length >= 40,
    "routing case request is too weak",
  );
  assert.ok(
    Array.isArray(fixture.routes) && fixture.routes.length > 0,
    `${fixture.request}: missing expected routes`,
  );
  for (const route of fixture.routes) {
    assert.ok(
      atomicSkills.includes(route.skill),
      `${fixture.request}: unknown skill ${route.skill}`,
    );
    const row = routeRows.get(route.skill);
    assert.ok(row, `${fixture.request}: ${route.skill} is unreachable`);
    assert.ok(
      route.signals.some((signal) => row.includes(signal.toLowerCase())),
      `${fixture.request}: router row for ${route.skill} lacks fixture signals`,
    );
  }
}

for (const boundary of fixtures.boundaries) {
  const skillText = await readFile(
    path.join(skillsRoot, boundary.skill, "SKILL.md"),
    "utf8",
  );
  assert.match(
    skillText,
    /^## (?:Routing boundary|Route elsewhere)$/m,
    `${boundary.skill}: missing explicit routing boundary`,
  );
  for (const target of boundary.mustMention) {
    assert.ok(
      skillText.includes(target),
      `${boundary.skill}: boundary must mention ${target}`,
    );
  }
}

for (const skill of atomicSkills) {
  const skillText = await readFile(
    path.join(skillsRoot, skill, "SKILL.md"),
    "utf8",
  );
  assert.match(
    skillText,
    /^## (?:Routing boundary|Route elsewhere)$/m,
    `${skill}: every atomic skill needs an explicit routing boundary`,
  );
  const linkedSkills = [
    ...skillText.matchAll(/\$(threejs-[a-z0-9-]+)/g),
  ].map((match) => match[1]);
  for (const linkedSkill of linkedSkills) {
    assert.ok(
      skillNames.includes(linkedSkill),
      `${skill}: links unknown skill ${linkedSkill}`,
    );
  }
}

console.log(
  `Agent routing semantics passed: ${fixtures.cases.length} forward cases, ` +
  `${fixtures.boundaries.length} ambiguity boundaries, ${atomicSkills.length} atomic routes.`,
);
