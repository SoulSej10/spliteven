// Regenerates the icon maps in both apps' AppIcon components from packages/shared/src/appIcons.ts.
// Run after adding an icon to the catalog:  node scripts/gen-icon-components.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const catalog = fs.readFileSync(path.join(root, "packages/shared/src/appIcons.ts"), "utf8");
const names = [...new Set([...catalog.matchAll(/\["[^"]+",\s*"(\w+)",\s*"[^"]*"\]/g)].map((m) => m[1]))].sort();

function block(fromPackage, typeImport) {
  const imports = names.map((n) => `  ${n},`).join("\n");
  return {
    imports: `import {\n${imports}${typeImport ? `\n  ${typeImport},` : ""}\n} from "${fromPackage}";`,
    map: `const ICONS: Record<string, Icon> = {\n${names.map((n) => `  ${n},`).join("\n")}\n};`,
  };
}

function rewrite(file, pkg, typeImport) {
  let s = fs.readFileSync(file, "utf8");
  const crlf = s.includes("\r\n");
  if (crlf) s = s.replace(/\r\n/g, "\n");
  const { imports, map } = block(pkg, typeImport);
  // the first import-from-phosphor block
  s = s.replace(new RegExp(`import \\{[^}]*\\} from "${pkg.replace(/[/@-]/g, "\\$&")}";`), imports);
  s = s.replace(/const ICONS: Record<[^>]+, Icon> = \{[\s\S]*?\n\};/, map);
  s = s.replace(/import \{ iconNameFor, type AppIconName \} from "@evensplit\/shared";/, 'import { iconNameFor } from "@evensplit/shared";');
  if (crlf) s = s.replace(/\n/g, "\r\n");
  fs.writeFileSync(file, s);
  console.log("updated", path.relative(root, file), names.length, "icons");
}

rewrite(path.join(root, "apps/mobile/src/components/ui/AppIcon.tsx"), "phosphor-react-native", null);
rewrite(path.join(root, "apps/web/src/components/ui/app-icon.tsx"), "@phosphor-icons/react", "type Icon");
