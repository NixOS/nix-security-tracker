# simple-code-frame

Tiny library for displaying code frames. The main difference to `@babel/code-frame` is that this library doesn't ship with a parser. It is soley aimed at taking text input and adding column + line markers.

## Usage

```bash
npm install simple-code-frame
# or via yarn
yarn add simple-code-frame
```

Usage

```js
import { createCodeFrame } from 'simple-code-frame';

const str = `foo\nbar\nbob`;

const codeFrame = createCodeFrame(str, 1, 2);
console.log(codeFrame);
// Logs:
//   1 | foo
// > 2 | bar
//     |  ^
//   3 | bob
```

### License

`MIT`, see [the license file](./LICENSE).
