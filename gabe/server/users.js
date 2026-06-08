// Server-side user directory (mirrors the frontend roles config).
const ALL_PORTALS = ['dashboard', 'feasibility', 'construction', 'asset', 'investor', 'planner', 'agentic'];

const USERS = [
  { username: 'revity', password: 'propdev26', name: 'Michael (Principal)', role: 'executive',
    roleLabel: 'Executive', portals: ALL_PORTALS, projectAccess: 'all' },
  { username: 'dev', password: 'dev', name: 'Sarah Chen', role: 'developer',
    roleLabel: 'Development Manager',
    portals: ['dashboard', 'feasibility', 'construction', 'investor', 'planner', 'agentic'], projectAccess: 'all' },
  { username: 'john', password: 'john', name: 'John Trent', role: 'supervisor',
    roleLabel: 'Site Supervisor', portals: ['dashboard', 'construction', 'planner'], projectAccess: 'all' },
  { username: 'asset', password: 'asset', name: 'Lachlan Henderson', role: 'asset_manager',
    roleLabel: 'Asset Manager', portals: ['dashboard', 'asset', 'investor'], projectAccess: 'all' },
  { username: 'investor', password: 'investor', name: 'Henderson Capital', role: 'investor',
    roleLabel: 'Investor', portals: ['dashboard', 'investor'], projectAccess: 'all' },
];

function publicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

module.exports = { USERS, publicUser };
