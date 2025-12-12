import type { ModelBuild, Project } from '~/types/projects';

export interface NavigationModelEntry {
  label: string;
  description: string;
  value: string;
  meta: {
    project: Project;
    model: ModelBuild;
    id: string;
  };
}

export interface NavigationProjectEntry {
  label: string;
  description: string;
  defaultOpen: boolean;
  slot: string;
  children: NavigationModelEntry[];
}

export interface TaskItem {
  label: string;
  description: string;
  points: string[];
}

export function buildNavigationLinks(projects: Project[]): NavigationProjectEntry[] {
  return projects.map((project) => ({
    label: project.title,
    description: project.summary,
    defaultOpen: true,
    slot: 'project',
    children: project.models.map((model) => ({
      label: model.name,
      description: model.description,
      value: `${project.slug}-${model.id}`,
      meta: { project, model, id: model.id }
    }))
  }));
}

export function buildTaskItems(project: Project | null | undefined): TaskItem[] {
  if (!project) return [];

  return project.tasks.map((task) => ({
    label: task.title,
    description: task.summary,
    points: task.details
  }));
}

export function selectDefaultProjectModel(projects: Project[]): {
  project: Project | null;
  model: ModelBuild | null;
} {
  const defaultProject = projects[0] ?? null;
  const defaultModel = defaultProject?.models[0] ?? null;

  return { project: defaultProject, model: defaultModel };
}
