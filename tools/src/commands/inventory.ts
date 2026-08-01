import { inventory } from '../audit.ts';

const state = await inventory();
console.log(`Workspaces: ${state.workspaces}`);
console.log(`Maintained files: ${state.sourceFiles}`);
console.log(`Maintained JavaScript-family files: ${state.javascriptFiles}`);
console.log(`Maintained TypeScript-family files: ${state.typescriptFiles}`);
