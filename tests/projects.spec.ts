import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { projects } from '~/data/projects';

const projectRoot = process.cwd();

function resolvePublicPath(publicPath: string) {
  const trimmed = publicPath.replace(/^\//, '');
  return path.join(projectRoot, 'public', trimmed);
}

describe('project registry', () => {
  it('contains at least one project and model', () => {
    expect(projects.length).toBeGreaterThan(0);
    const first = projects[0];
    expect(first.models.length).toBeGreaterThan(0);
  });

  it('ensures every model path exists on disk', () => {
    for (const project of projects) {
      for (const model of project.models) {
        const target = resolvePublicPath(model.path);
        const exists = fs.existsSync(target);
        expect(exists).toBe(true);
      }
    }
  });

  it('includes three escalating tasks per project', () => {
    for (const project of projects) {
      expect(project.tasks.length).toBe(3);
      project.tasks.forEach((task) => {
        expect(task.title).toBeTruthy();
        expect(task.summary).toBeTruthy();
        expect(task.details.length).toBeGreaterThan(0);
      });
    }
  });

  it('provides review guidance for every project', () => {
    for (const project of projects) {
      expect(project.instructions.trim().length).toBeGreaterThan(0);
    }
  });
});
