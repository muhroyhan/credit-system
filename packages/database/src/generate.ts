import { execFileSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

const root = process.cwd();
const temporary = await mkdtemp(join(root, '.credit-baseline-'));
const output = join(temporary, 'output');
const config = join(temporary, 'drizzle.config.ts');
const destination = join(root, 'packages/database/drizzle');
if (!resolve(temporary).startsWith(`${resolve(root)}${sep}.credit-baseline-`)) {
  throw new Error('Invalid temporary path');
}
try {
  await writeFile(
    config,
    `import { defineConfig } from 'drizzle-kit';
export default defineConfig({ dialect: 'mysql', schema: './packages/database/src/schema.ts', out: ${JSON.stringify(`./${relative(root, output).replaceAll('\\', '/')}`)}, dbCredentials: { url: process.env.DATABASE_URL ?? '' } });
`,
  );
  execFileSync(
    process.execPath,
    [
      join(root, 'node_modules/drizzle-kit/bin.cjs'),
      'generate',
      '--config',
      config,
    ],
    { cwd: root, stdio: 'inherit' },
  );
  const sqlFile = (await readdir(output)).find((name) => name.endsWith('.sql'));
  if (!sqlFile) {
    throw new Error('Drizzle did not generate a baseline');
  }
  const sql = await readFile(join(output, sqlFile), 'utf8');
  const baseline = join(destination, '0000_baseline.sql');
  const previous = await readFile(baseline, 'utf8').catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        return '';
      }
      throw error;
    },
  );
  if (sql !== previous) {
    const snapshot = await readFile(
      join(output, 'meta/0000_snapshot.json'),
      'utf8',
    );
    await writeFile(baseline, sql);
    await writeFile(join(destination, 'meta/0000_snapshot.json'), snapshot);
    process.stdout.write(
      'Baseline updated; recreate disposable databases before migrating.\n',
    );
  } else {
    process.stdout.write('Baseline unchanged.\n');
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
