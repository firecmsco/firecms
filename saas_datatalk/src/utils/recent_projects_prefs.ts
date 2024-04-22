const MOST_RECENT_PROJECTS_KEY = "recent_projects";

export function saveRecentProject(uid: string, projectId: string) {
    localStorage.setItem(`${uid}//${MOST_RECENT_PROJECTS_KEY}`, projectId);
}

export function getRecentProject(uid: string): string | null {
    return localStorage.getItem(`${uid}//${MOST_RECENT_PROJECTS_KEY}`);
}
