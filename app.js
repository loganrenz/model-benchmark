const sidebar = document.getElementById('sidebar');
const selectionEl = document.getElementById('selection');
const statusEl = document.getElementById('status');
const preview = document.getElementById('preview');
const openLink = document.getElementById('open-link');

let manifest = null;
let currentProject = null;
let currentModel = null;

async function loadManifest() {
  try {
    const res = await fetch('./data/manifest.json');
    if (!res.ok) throw new Error(`Manifest request failed: ${res.status}`);
    manifest = await res.json();
    renderSidebar();
    applyRoute(location.hash);
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Failed to load manifest. Please ensure data/manifest.json exists.';
    selectionEl.textContent = 'Error';
  }
}

function renderSidebar() {
  sidebar.innerHTML = '';
  if (!manifest || !Array.isArray(manifest.projects)) return;
  manifest.projects.forEach((project) => {
    const section = document.createElement('div');
    section.className = 'sidebar-section';

    const title = document.createElement('h2');
    title.textContent = project.title || project.id;
    section.appendChild(title);

    const prompt = document.createElement('small');
    prompt.textContent = project.prompt || '';
    section.appendChild(prompt);

    const list = document.createElement('ul');
    list.className = 'model-list';

    (project.implementations || []).forEach((impl) => {
      const item = document.createElement('li');
      item.className = 'model-item';
      item.dataset.project = project.id;
      item.dataset.model = impl.modelId;
      item.addEventListener('click', () => selectImplementation(project.id, impl.modelId));

      const titleEl = document.createElement('span');
      titleEl.className = 'model-title';
      titleEl.textContent = impl.title || impl.modelId;
      item.appendChild(titleEl);

      const meta = document.createElement('span');
      meta.className = 'model-meta';
      meta.textContent = impl.modelId;
      item.appendChild(meta);

      list.appendChild(item);
    });

    section.appendChild(list);
    sidebar.appendChild(section);
  });
}

function parseHash(hash) {
  if (!hash || !hash.startsWith('#/')) return null;
  const parts = hash.slice(2).split('/');
  if (parts.length < 2) return null;
  return { projectId: parts[0], modelId: parts[1] };
}

function applyRoute(hash) {
  if (!manifest || !manifest.projects?.length) return;
  const parsed = parseHash(hash);
  let projectId = parsed?.projectId;
  let modelId = parsed?.modelId;

  const project = manifest.projects.find((p) => p.id === projectId) || manifest.projects[0];
  const model = project.implementations.find((m) => m.modelId === modelId) || project.implementations[0];

  selectImplementation(project.id, model.modelId, false);
}

function selectImplementation(projectId, modelId, updateHash = true) {
  if (!manifest) return;
  const project = manifest.projects.find((p) => p.id === projectId);
  const impl = project?.implementations.find((m) => m.modelId === modelId);
  if (!project || !impl) return;

  currentProject = project;
  currentModel = impl;

  if (updateHash) {
    const newHash = `#/${projectId}/${modelId}`;
    if (location.hash !== newHash) {
      location.hash = newHash;
    }
  }

  selectionEl.textContent = `${project.title || project.id} • ${impl.title || impl.modelId}`;
  preview.src = impl.path;
  openLink.href = impl.path;
  statusEl.textContent = `Loaded ${impl.modelId} for ${project.id}`;

  updateActiveState();
}

function updateActiveState() {
  document.querySelectorAll('.model-item').forEach((item) => {
    const isActive =
      item.dataset.project === currentProject?.id && item.dataset.model === currentModel?.modelId;
    item.classList.toggle('active', isActive);
  });
}

window.addEventListener('hashchange', () => applyRoute(location.hash));
window.addEventListener('DOMContentLoaded', loadManifest);
