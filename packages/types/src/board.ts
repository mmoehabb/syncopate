export interface CreateBoardPayload {
  workspaceId: string;
  name: string;
  repositoryName?: string;
  githubRepoId?: string;
}
