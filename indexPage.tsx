/** @jsx h */
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="dom.iterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import {
  doc,
  DocNode,
  getStyleTag,
  h,
  Helmet,
  renderSSR,
  tw,
  virtualSheet,
} from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/deps.ts";
import { gtw } from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/components/styles.ts";
import {
  sheet,
  store,
} from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/shared.ts";
import { App } from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/components/app.tsx";
import { getBody } from "https://raw.githubusercontent.com/denoland/docland/194467fb0412b9f9304e39adc87bc6bbe4ca1c46/util.ts";

export function indexPage() {
  sheet.reset();
  const page = renderSSR(() => (
    <App>
      <main class={gtw("main")}>
        <h1 class={gtw("mainHeader")}>Deno Doc</h1>
        <div
          class={tw`py-6 md:(col-span-3 py-12)`}
        >
          <div class={tw`space-y-4`}>
            <p>
              <a href="./deno/stable/index.html" class={gtw("formButton")}>
                Deno CLI APIs (Stable)
              </a>
            </p>
            <p>
              <a href="./deno/unstable/index.html" class={gtw("formButton")}>
                Deno CLI APIs (<code>--unstable</code>)
              </a>
            </p>
          </div>
        </div>
      </main>
    </App>
  ));
  return getBody(
    Helmet.SSR(page),
    getStyleTag(sheet),
  );
}
