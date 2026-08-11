/**
 * UTMRouter.ts
 * Dynamic UTM Persona Router & Role Synchronization Engine
 * Handles client-side & server-side URL parameter parsing (?utm_role= / ?utm_persona=),
 * localStorage persistence ('pharos_utm_role'), and event subscription bus.
 */

export type PersonaRole = 'clinician' | 'nurse' | 'patient';

export const ALLOWED_ROLES: PersonaRole[] = ['clinician', 'nurse', 'patient'];
export const DEFAULT_ROLE: PersonaRole = 'clinician';
export const STORAGE_KEY = 'pharos_utm_role';

export type RoleChangeListener = (role: PersonaRole) => void;

export class UTMRouter {
  private currentRole: PersonaRole = DEFAULT_ROLE;
  private listeners: Set<RoleChangeListener> = new Set();
  private isBrowser: boolean = false;

  constructor() {
    this.isBrowser = typeof window !== 'undefined';
    this.initRole();
    if (this.isBrowser) {
      window.addEventListener('popstate', () => this.handlePopState());
    }
  }

  /**
   * Parses URL query parameters for utm_role or utm_persona.
   */
  public static parseRoleFromUrl(urlString?: string): PersonaRole | null {
    try {
      let searchParams: URLSearchParams;
      if (typeof window !== 'undefined' && !urlString) {
        searchParams = new URLSearchParams(window.location.search);
      } else if (urlString) {
        const urlObj = new URL(urlString, 'http://localhost');
        searchParams = urlObj.searchParams;
      } else {
        return null;
      }

      const roleVal = searchParams.get('utm_role');
      if (roleVal) {
        const normRole = roleVal.toLowerCase().trim() as PersonaRole;
        if (ALLOWED_ROLES.includes(normRole)) {
          return normRole;
        }
      }

      const personaVal = searchParams.get('utm_persona');
      if (personaVal) {
        const normPersona = personaVal.toLowerCase().trim() as PersonaRole;
        if (ALLOWED_ROLES.includes(normPersona)) {
          return normPersona;
        }
      }
    } catch (e) {
      console.warn('[UTMRouter] Error parsing URL query parameters:', e);
    }
    return null;
  }

  private initRole(): void {
    if (!this.isBrowser) {
      this.currentRole = DEFAULT_ROLE;
      return;
    }

    // 1. Try URL parameters first
    const urlRole = UTMRouter.parseRoleFromUrl();
    if (urlRole) {
      this.currentRole = urlRole;
      this.persistRole(urlRole);
      return;
    }

    // 2. Try localStorage persistence second
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ALLOWED_ROLES.includes(stored as PersonaRole)) {
        this.currentRole = stored as PersonaRole;
        return;
      }
    } catch (e) {
      console.warn('[UTMRouter] localStorage read error:', e);
    }

    // 3. Fallback to default clinician role
    this.currentRole = DEFAULT_ROLE;
  }

  private persistRole(role: PersonaRole): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch (e) {
      console.warn('[UTMRouter] localStorage write error:', e);
    }
  }

  private getStoredRole(): PersonaRole | null {
    if (!this.isBrowser) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ALLOWED_ROLES.includes(stored as PersonaRole)) {
        return stored as PersonaRole;
      }
    } catch (e) {
      console.warn('[UTMRouter] localStorage read error:', e);
    }
    return null;
  }

  private handlePopState(): void {
    const urlRole = UTMRouter.parseRoleFromUrl() || this.getStoredRole() || DEFAULT_ROLE;
    if (urlRole !== this.currentRole) {
      this.currentRole = urlRole;
      this.persistRole(urlRole);
      this.notifyListeners();
    }
  }

  /**
   * Returns current active persona role.
   */
  public getRole(): PersonaRole {
    return this.currentRole;
  }

  /**
   * Sets persona role, syncs with URL and localStorage, and notifies all subscribers.
   */
  public setRole(newRole: PersonaRole, updateUrl: boolean = true): void {
    if (!ALLOWED_ROLES.includes(newRole)) {
      console.warn(`[UTMRouter] Invalid role '${newRole}'. Allowed: ${ALLOWED_ROLES.join(', ')}`);
      return;
    }

    if (this.currentRole === newRole && !updateUrl) return;

    this.currentRole = newRole;
    this.persistRole(newRole);

    if (this.isBrowser && updateUrl) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('utm_role', newRole);
        window.history.pushState({ utm_role: newRole }, '', url.toString());
      } catch (e) {
        console.warn('[UTMRouter] Failed to update URL pushState:', e);
      }
    }

    this.notifyListeners();
  }

  /**
   * Subscribes to role change events. Returns unbind function.
   */
  public subscribe(listener: RoleChangeListener): () => void {
    this.listeners.add(listener);
    // Notify immediately with current role (wrapped in try-catch to isolate exceptions)
    try {
      listener(this.currentRole);
    } catch (e) {
      console.error('[UTMRouter] Error in subscriber initial callback:', e);
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentRole);
      } catch (e) {
        console.error('[UTMRouter] Error in subscriber listener callback:', e);
      }
    });
  }
}

// Singleton export for browser execution
export const utmRouter = new UTMRouter();
