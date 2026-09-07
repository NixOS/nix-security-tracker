<h1 align="center">vite-prerender-plugin</h1>

<p align="center">
  <picture width="100">
    <img src="./media/logo.png">
  </picture>
</p>

<p align="center">Effortless prerendering in every framework</p>

---

This is largely an extracted implementation of [@preact/preset-vite](https://github.com/preactjs/preset-vite)'s prererender functionality ([license](https://github.com/preactjs/preset-vite/blob/main/LICENSE)), which in turn is a reimplementation of [WMR](https://github.com/preactjs/wmr)'s prerendering ([license](https://github.com/preactjs/wmr/blob/main/LICENSE)).

## Getting Started

```bash
$ npm install vite-prerender-plugin
```

```js
// vite.config.js
import { defineConfig } from 'vite';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';

export default defineConfig({
    plugins: [vitePrerenderPlugin()],
});
```

To prerender your app, you'll need to do three things:

1. Set your `renderTarget` via the plugin option. This should, in all likelihood, match the query selector for where you render your app client-side, i.e., `render(<App />, document.querySelector('#app'))` -> `'#app'`

2. Specify your prerender script, which can be done by a) adding a `prerender` attribute to one of the scripts listed in your entry HTML (`<script prerender src="./my-prerender-script.js">`) or b) use the `prerenderScript` plugin option to specify the location of your script with an absolute path

3. Export a function named `prerender()` from your prerender script (see below for an example)

The plugin simply calls the prerender function you provide so it's up to you to determine how your app should be prerendered, likely you'll want to use the `render-to-string` implementation of your framework. This prerender function can be sync or async, so feel free to initialize your app data with `fetch()` calls, read local data with `fs.readFile()`, etc. All that's required is that your return an object containing an `html` property which is the string of HTML you want injected into your HTML document.

With that, you're all ready to build!

For full examples, please see the [examples directory](./examples), and if you don't see your framework listed, let me know! I can take a look to see at adding it.

## Options

| Option                      | Type     | Default       | Description                                                                                                                                                                                                                                                    |
| --------------------------- | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `renderTarget`              | `string` | `"body"`      | Query selector for where to insert prerender result in your HTML template                                                                                                                                                                                      |
| `prerenderScript`           | `string` | `undefined`   | Absolute path to script containing exported `prerender()` function. If not provided, the plugin will try to find the prerender script in the scripts listed in your HTML entrypoint                                                                            |
| `additionalPrerenderRoutes` | `string` | `undefined`   | While the prerendering process can automatically find new links in your app to prerender, sometimes you will have pages that are not linked to but you still want them prerendered (such as a `/404` page). Use this option to add them to the prerender queue |
| `previewMiddlewareFallback` | `string` | `/index.html` | Fallback path to be used when an HTML document cannot be found via the preview middleware, e.g., `/404` or `/not-found` will be returned when the user requests `/some-path-that-does-not-exist`                                                               |

## Advanced Prerender Options

Additionally, your `prerender()` function can return more than just HTML -- it can return additional links to prerender as well as information that should be set in the `<head>` of the HTML document, such as title, language, or meta tags. For example:

```js
export async function prerender(data) {
    const html = '<h1>hello world</h1>';

    return {
        html,

        // Optionally add additional links that should be
        // prerendered (if they haven't already been)
        links: new Set(['/foo', '/bar']),

        // Optional data to serialize into a script tag for use on the client:
        //   <script type="application/json" id="prerender-data">{"url":"/"}</script>
        data: { url: data.url },

        // Optionally configure and add elements to the `<head>` of
        // the prerendered HTML document
        head: {
            // Sets the "lang" attribute: `<html lang="en">`
            lang: 'en',

            // Sets the title for the current page: `<title>My cool page</title>`
            title: 'My cool page',

            // Sets any additional elements you want injected into the `<head>`:
            //   <link rel="stylesheet" href="foo.css">
            //   <meta property="og:title" content="Social media title">
            elements: new Set([
                { type: 'link', props: { rel: 'stylesheet', href: 'foo.css' } },
                { type: 'meta', props: { property: 'og:title', content: 'Social media title' } },
            ]),
        },
    };
}
```

For those not using `preact-iso` (be it not using Preact at all or simply using other tools), this library exposes a `parseLinks` function which you can use to crawl your site for links to prerender. The function takes an HTML string and returns an array of links found in the document. To be valid, they must have an `href` attribute set and the `target` attribute, if set, must be `_self`.

```js
export async function prerender() {
    const html = `
        <div>
            <a href="/foo">Foo</a>
            <a href="/bar" target="_blank">Bar</a>
            <a href="/baz" target="_top">Baz</a>
        </div>
    `;

    const { parseLinks } = await import('vite-prerender-plugin/parse');
    const links = parseLinks(html); // ['/foo']

    return {
        html,
        links: new Set(links),
    };
}
```

> **Note**: Anything you want to be server-only, like `parseLinks` from the example above, should be dynamically imported in the prerender function. A static import will see that code included in your client bundle, inflating it for a code path that will never run.

## Licenses

[MIT](https://github.com/preactjs/vite-prerender-plugin/blob/master/LICENSE)

[WMR - MIT](https://github.com/preactjs/wmr/blob/main/LICENSE)

[Preact Vite Preset - MIT](https://github.com/preactjs/preset-vite/blob/main/LICENSE)
