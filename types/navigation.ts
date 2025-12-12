export interface ModelNode {
  id: string;
  title: string;
  path: string;
  summary?: string;
}

export interface ProjectNode {
  id: string;
  title: string;
  description?: string;
  models: ModelNode[];
}
