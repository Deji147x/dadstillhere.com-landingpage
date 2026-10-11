// Where the posting record lives. Outside the repo by default: the cron writes it
// every day, and a file that changes daily inside a git working copy will fight
// the next `git pull` — or quietly lose the record of what already went out.
//
// Override with QUEUE_PATH. Falls back to the in-repo path if /var/lib isn't
// writable (a laptop, a dry run), and migrates the old file across on first use.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const REPO_QUEUE = 'content/social/queue.json';

export async function queuePath(root) {
  if (process.env.QUEUE_PATH) return process.env.QUEUE_PATH;
  const live = '/var/lib/dsh/queue.json';
  try {
    await mkdir(dirname(live), { recursive: true });
    await access(dirname(live));
    if (!existsSync(live) && existsSync(join(root, REPO_QUEUE))) {
      await writeFile(live, await readFile(join(root, REPO_QUEUE), 'utf8'));  // migrate once
    }
    return live;
  } catch {
    return join(root, REPO_QUEUE);
  }
}

export async function loadQueue(root) {
  const p = await queuePath(root);
  return { path: p, queue: existsSync(p) ? JSON.parse(await readFile(p, 'utf8')) : {} };
}

export async function saveQueue(path, queue) {
  await writeFile(path, JSON.stringify(queue, null, 2) + '\n');
}
