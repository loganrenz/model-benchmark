import { describe, expect, it } from 'vitest';
import type { ModelBuild, Project } from '~/types/projects';
import { buildNavigationLinks, buildTaskItems, selectDefaultProjectModel } from '~/utils/projects';

const demoProjects: Project[] = [
  {
    slug: 'demo-project',
    title: 'Demo Project',
    summary: 'A project used for testing.',
    instructions: 'Follow the test plan.',
    models: [
      {
        id: 'alpha',
        name: 'Alpha Build',
        description: 'First build',
        path: '/projects/demo/alpha/index.html'
      },
      {
        id: 'beta',
        name: 'Beta Build',
        description: 'Second build',
        path: '/projects/demo/beta/index.html'
      }
    ],
    tasks: [
      {
        id: 'task-1',
        title: 'Set up',
        summary: 'Prepare the environment.',
        details: ['Install dependencies', 'Verify configuration']
      }
    ]
  }
];

const emptyProjects: Project[] = [];

function buildProject(slug: string, modelCount: number): Project {
  const models: ModelBuild[] = Array.from({ length: modelCount }, (_, index) => ({
    id: `model-${index + 1}`,
    name: `Model ${index + 1}`,
    description: `Build ${index + 1}`,
    path: `/projects/${slug}/model-${index + 1}/index.html`
  }));

  return {
    slug,
    title: `Project ${slug}`,
    summary: `${slug} summary`,
    instructions: 'Do the thing',
    models,
    tasks: []
  };
}

describe('project utilities', () => {
  it('builds navigation links with project and model metadata', () => {
    const navigation = buildNavigationLinks(demoProjects);

    expect(navigation).toHaveLength(1);
    expect(navigation[0]).toMatchObject({
      label: 'Demo Project',
      description: 'A project used for testing.',
      defaultOpen: true,
      slot: 'project'
    });

    expect(navigation[0].children).toHaveLength(2);
    expect(navigation[0].children[0]).toMatchObject({
      label: 'Alpha Build',
      description: 'First build',
      value: 'demo-project-alpha'
    });
    expect(navigation[0].children[0].meta.model.path).toBe('/projects/demo/alpha/index.html');
  });

  it('builds task items with labels and details', () => {
    const tasks = buildTaskItems(demoProjects[0]);

    expect(tasks).toEqual([
      {
        label: 'Set up',
        description: 'Prepare the environment.',
        points: ['Install dependencies', 'Verify configuration']
      }
    ]);
  });

  it('returns empty task items when no project is provided', () => {
    expect(buildTaskItems(null)).toEqual([]);
    expect(buildTaskItems(undefined)).toEqual([]);
  });

  it('selects the first project and model when available', () => {
    const { project, model } = selectDefaultProjectModel(demoProjects);

    expect(project?.slug).toBe('demo-project');
    expect(model?.id).toBe('alpha');
  });

  it('returns null defaults when no projects exist', () => {
    const { project, model } = selectDefaultProjectModel(emptyProjects);

    expect(project).toBeNull();
    expect(model).toBeNull();
  });

  it('builds navigation links for multiple projects', () => {
    const multiProjects = [buildProject('one', 1), buildProject('two', 2)];
    const navigation = buildNavigationLinks(multiProjects);

    expect(navigation).toHaveLength(2);
    expect(navigation[1].children).toHaveLength(2);
    expect(navigation[1].children[1].value).toBe('two-model-2');
  });
});
