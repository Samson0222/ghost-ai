export interface ProjectSpecListItem {
  id: string;
  createdAt: string;
  filename: string;
}

export function specDownloadUrl(projectId: string, specId: string): string {
  return `/api/projects/${projectId}/specs/${specId}/download`;
}

export function downloadSpecFile(projectId: string, specId: string, filename: string) {
  const link = document.createElement("a");
  link.href = specDownloadUrl(projectId, specId);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
