import { promises as fs } from 'node:fs';
import { join } from 'node:path';

export class FilesystemStore {
  constructor(rootDir) {
    this.rootDir = rootDir;
  }

  async ensureDir(path) {
    await fs.mkdir(path, { recursive: true });
  }

  async writeArtifact(snapshotId, bodyText) {
    if (!bodyText) return undefined;
    const artifactsDir = join(this.rootDir, 'artifacts');
    await this.ensureDir(artifactsDir);
    const artifactPath = join(artifactsDir, `${snapshotId}.txt`);
    await fs.writeFile(artifactPath, bodyText, 'utf8');
    return artifactPath;
  }

  async writeSnapshot(input) {
    const snapshotsDir = join(this.rootDir, 'snapshots');
    await this.ensureDir(snapshotsDir);

    const artifactPath = await this.writeArtifact(input.id, input.bodyText);
    const snapshot = { ...input, artifactPath };

    const snapshotPath = join(snapshotsDir, `${input.id}.json`);
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');

    const latestPath = join(snapshotsDir, 'latest.json');
    await fs.writeFile(latestPath, JSON.stringify(snapshot, null, 2), 'utf8');

    return snapshot;
  }
}
