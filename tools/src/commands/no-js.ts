import { assertNoJavascript } from '../audit.ts';

await assertNoJavascript();
console.log('No maintained JavaScript-family source files found.');
