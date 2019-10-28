# @alloc/git-patch-parser

Improved fork of [meteor/git-patch-parser](https://github.com/meteor/git-patch-parser)

```ts
import {parsePatch} from '@alloc/git-patch-parser'

const contents = fs.readFileSync('example.patch', 'utf8')
const patch = parsePatch(contents)
```

&nbsp;

## `parsePatch(contents: string): ParsedPatch`

Parse a single patch.

&nbsp;

## `parseMultiPatch(contents: string): ParsedPatch[]`

Parse an array of patches.

&nbsp;

## `parseUnifiedDiff(contents: string): DiffChunk[]`

Parse a string like this:

```patch
diff --git a/Libraries/Components/TextInput/TextInput.js b/Libraries/Components/TextInput/TextInput.js
index f0cf5b955e..754af17e1b 100644
--- a/Libraries/Components/TextInput/TextInput.js
+++ b/Libraries/Components/TextInput/TextInput.js
@@ -20,6 +20,7 @@ const PropTypes = require('prop-types');
 const ReactNative = require('ReactNative');
 const StyleSheet = require('StyleSheet');
 const Text = require('Text');
+const TextAncestor = require('TextAncestor');
 const TextInputState = require('TextInputState');
 /* $FlowFixMe(>=0.54.0 site=react_native_oss) This comment suppresses an error
  * found when Flow v0.54 was deployed. To see the error delete this comment and
@@ -28,7 +29,6 @@ const TimerMixin = require('react-timer-mixin');
 const TouchableWithoutFeedback = require('TouchableWithoutFeedback');
 const UIManager = require('UIManager');
 const ViewPropTypes = require('ViewPropTypes');
-const {ViewContextTypes} = require('ViewContext');

 const emptyFunction = require('fbjs/lib/emptyFunction');
 const invariant = require('fbjs/lib/invariant');
```
