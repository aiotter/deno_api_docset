import {
  DocNode,
  DocNodeInterface,
  DocNodeNamespace,
} from "https://raw.githubusercontent.com/denoland/docland/ac0404d5af4a7c2bd2159cec3cddb13569c9f4e6/deps.ts";
import { makeDoc } from "https://deno.land/x/dash_doc@v0.3.4/mod.ts";

async function makeDenoDoc(
  name: string,
  { unstable = false }: { unstable?: boolean },
) {
  const args = ["doc", "--json"];
  if (unstable) args.push("--unstable");

  const proc = new Deno.Command(Deno.execPath(), { args, stdout: "piped" })
    .spawn();

  const apiData = await new Response(proc.stdout).json().catch(() => {
    throw Error(
      "Usage: deno deno run --allow-write=deno.docset --allow-read=. --no-check main.ts",
    );
  });

  const entries = mergeEntries(apiData);
  await makeDoc(
    name,
    // `https://deno.land/api${unstable ? "?unstable" : ""}`,
    unstable ? "deno/unstable" : "deno/stable",
    entries,
  );
}

// Copied from https://github.com/denoland/docland/blob/d26f2c15e4bedd6b6a6114c3a129d7abdda2e55d/docs.ts#L514-L553
function mergeEntries(entries: DocNode[]) {
  const merged: DocNode[] = [];
  const namespaces = new Map<string, DocNodeNamespace>();
  const interfaces = new Map<string, DocNodeInterface>();
  for (const node of entries) {
    if (node.kind === "namespace") {
      const namespace = namespaces.get(node.name);
      if (namespace) {
        namespace.namespaceDef.elements.push(...node.namespaceDef.elements);
        if (!namespace.jsDoc) {
          namespace.jsDoc = node.jsDoc;
        }
      } else {
        namespaces.set(node.name, node);
        merged.push(node);
      }
    } else if (node.kind === "interface") {
      const int = interfaces.get(node.name);
      if (int) {
        int.interfaceDef.callSignatures.push(
          ...node.interfaceDef.callSignatures,
        );
        int.interfaceDef.indexSignatures.push(
          ...node.interfaceDef.indexSignatures,
        );
        int.interfaceDef.methods.push(...node.interfaceDef.methods);
        int.interfaceDef.properties.push(...node.interfaceDef.properties);
        if (!int.jsDoc) {
          int.jsDoc = node.jsDoc;
        }
      } else {
        interfaces.set(node.name, node);
        merged.push(node);
      }
    } else {
      merged.push(node);
    }
  }
  return merged;
}

if (import.meta.main) {
  console.log(`Creating doc for deno v${Deno.version.deno}`);

  await makeDenoDoc("deno", { unstable: true });

  await Deno.copyFile(
    new URL("Info.plist", import.meta.url),
    "deno.docset/Contents/Info.plist",
  );
}
