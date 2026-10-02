// A team invitation link can be opened while logged out. We remember its token
// across the login / signup / OAuth round-trip so the accept page can pick it
// back up once there is a session.
const KEY = 'dkit_pending_invite';
const SECTION_KEY = 'dkit_dash_section';

export const getPendingInvite = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const setPendingInvite = (t) => { try { localStorage.setItem(KEY, t); } catch { /* storage unavailable */ } };
export const clearPendingInvite = () => { try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ } };

// One-shot hint telling Dashboard which tab to open on its next mount
export const requestDashboardSection = (s) => { try { sessionStorage.setItem(SECTION_KEY, s); } catch { /* storage unavailable */ } };
export const takeDashboardSection = () => {
  try { const s = sessionStorage.getItem(SECTION_KEY) || ''; sessionStorage.removeItem(SECTION_KEY); return s; }
  catch { return ''; }
};
