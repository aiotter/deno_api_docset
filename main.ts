import {
  DocNode,
  DocNodeInterface,
  DocNodeNamespace,
} from "https://raw.githubusercontent.com/denoland/docland/ac0404d5af4a7c2bd2159cec3cddb13569c9f4e6/deps.ts";
import { makeDoc } from "https://deno.land/x/dash_doc@v0.3.0/mod.ts";
import { indexPage } from "./indexPage.tsx";

async function makeDenoDoc(name: string, unstable?: boolean, version?: string) {
  const error = new Error();
  const data = await fetch(
    new URL(
      `${unstable ? "unstable" : "stable"}${version ? `_${version}` : ""}.json`,
      "https://github.com/denoland/docland/raw/main/static/",
    ),
  ).then((response) => {
    if (!response.ok) {
      error.message =
        `Cannot fetch data of deno version ${version} (${response.status} ${response.statusText})`;
      throw error;
    }
    return response.json();
  });

  const entries = mergeEntries(data);
  await makeDoc(name, unstable ? "deno/unstable" : "deno/stable", entries);
}

// Copied from https://github.com/denoland/docland/blob/ac0404d5af4a7c2bd2159cec3cddb13569c9f4e6/routes/doc.tsx#L153-L192
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
  if (Deno.args.length > 0 && !Deno.args[0].startsWith("v")) {
    console.error("Error: Version specifier must starts with 'v'");
    Deno.exit(1);
  }

  const version = Deno.args.length > 0 ? Deno.args[0] : undefined;
  await Promise.all([
    makeDenoDoc("deno", false, version),
    makeDenoDoc("deno", true, version),
  ]);

  await Deno.writeTextFile(
    "deno.docset/Contents/Resources/Documents/index.html",
    indexPage(),
  );
  await Deno.copyFile(
    new URL("Info.plist", import.meta.url),
    "deno.docset/Contents/Info.plist",
  );
}
