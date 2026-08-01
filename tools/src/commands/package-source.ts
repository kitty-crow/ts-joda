import { cleanPublishedSource, installPublishedSource } from '../publish.ts';

const action = process.argv[2];
if (action === 'install') {
    console.log(`Installed ${await installPublishedSource()} generated source files for packaging.`);
} else if (action === 'clean') {
    console.log(`Removed ${await cleanPublishedSource()} generated source files after packaging.`);
} else {
    throw new Error('Usage: package-source <install|clean>');
}
