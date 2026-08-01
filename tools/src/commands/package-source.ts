import { cleanPublishedSource, installPublishedSource } from '../publish.ts';
import { run } from '../run.ts';

run(async () => {
    const action = process.argv[2];
    if (action === 'install') {
        console.log(`Installed ${await installPublishedSource()} generated source files for packaging.`);
        return;
    }
    if (action === 'clean') {
        console.log(`Removed ${await cleanPublishedSource()} generated source files after packaging.`);
        return;
    }
    throw new Error('Usage: package-source <install|clean>');
});
