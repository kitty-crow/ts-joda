import { checkRepo } from './check/repo.ts';
import { checkRuntime } from './check/runtime.ts';

checkRepo();
if (!process.argv.includes('--repo-only')) {
    await checkRuntime();
}
console.log('Repository structure and compatibility checks passed.');
