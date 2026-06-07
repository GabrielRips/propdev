// Role-based access & portals.
// Project-scoped permissions: a supervisor only sees the projects assigned to them.

export type Role = 'executive' | 'developer' | 'supervisor' | 'asset_manager' | 'investor';

// Portals / top-level sections a user can reach.
export type Portal =
  | 'dashboard'    // portfolio overview + projects
  | 'planner'      // kanban
  | 'feasibility'  // feasibility engine (portfolio roll-up)
  | 'construction' // construction hub roll-up
  | 'asset'        // owned-asset portfolio
  | 'investor'     // lender / investor / JV packs
  | 'agentic';     // AI agent network

export interface PortalDef {
  id: Portal;
  label: string;
  path: string;
  icon: string;
  blurb: string;
}

export const PORTALS: PortalDef[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: '📊', blurb: 'Portfolio overview & projects' },
  { id: 'feasibility', label: 'Feasibility', path: '/feasibility', icon: '📈', blurb: 'Development & financial modelling' },
  { id: 'construction', label: 'Construction', path: '/construction', icon: '🏗️', blurb: 'Site delivery & compliance' },
  { id: 'asset', label: 'Assets', path: '/assets', icon: '🏠', blurb: 'Owned portfolio & rentals' },
  { id: 'investor', label: 'Investor', path: '/investor', icon: '🤝', blurb: 'Lender, investor & JV packs' },
  { id: 'planner', label: 'Planner', path: '/planner', icon: '🗂️', blurb: 'Tasks & payments board' },
  { id: 'agentic', label: 'Agentic', path: '/agentic', icon: '🤖', blurb: 'AI agent network' },
];

export interface GabeUser {
  username: string;
  password: string;
  name: string;
  role: Role;
  roleLabel: string;
  portals: Portal[];
  projectAccess: 'all' | string[]; // project ids, or 'all'
}

const ALL_PORTALS: Portal[] = PORTALS.map((p) => p.id);

export const USERS: GabeUser[] = [
  {
    username: 'revity', password: 'propdev26', name: 'Michael (Principal)', role: 'executive',
    roleLabel: 'Executive', portals: ALL_PORTALS, projectAccess: 'all',
  },
  {
    username: 'dev', password: 'dev', name: 'Sarah Chen', role: 'developer',
    roleLabel: 'Development Manager',
    portals: ['dashboard', 'feasibility', 'construction', 'investor', 'planner', 'agentic'],
    projectAccess: 'all',
  },
  {
    username: 'john', password: 'john', name: 'John Trent', role: 'supervisor',
    roleLabel: 'Site Supervisor',
    portals: ['dashboard', 'construction', 'planner'],
    projectAccess: ['proj-001', 'proj-003'], // only his two sites
  },
  {
    username: 'asset', password: 'asset', name: 'Lachlan Henderson', role: 'asset_manager',
    roleLabel: 'Asset Manager',
    portals: ['dashboard', 'asset', 'investor'],
    projectAccess: 'all',
  },
  {
    username: 'investor', password: 'investor', name: 'Henderson Capital', role: 'investor',
    roleLabel: 'Investor',
    portals: ['dashboard', 'investor'],
    projectAccess: ['proj-001', 'proj-003'],
  },
];

export function authenticate(username: string, password: string): GabeUser | null {
  return USERS.find((u) => u.username === username && u.password === password) ?? null;
}

export function canAccessProject(user: GabeUser | null, projectId: string): boolean {
  if (!user) return false;
  return user.projectAccess === 'all' || user.projectAccess.includes(projectId);
}

export function canAccessPortal(user: GabeUser | null, portal: Portal): boolean {
  if (!user) return false;
  return user.portals.includes(portal);
}
