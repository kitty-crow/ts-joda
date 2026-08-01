export type AsyncCommand = () => Promise<void>;

export function run(command: AsyncCommand): void {
    command().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
