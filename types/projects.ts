export interface ProjectTask {
  id: string;
  title: string;
  summary: string;
  details: string[];
}

export interface ModelBuild {
  id: string;
  name: string;
  description: string;
  path: string;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  models: ModelBuild[];
  tasks: ProjectTask[];
  instructions: string;
}
