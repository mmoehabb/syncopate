export interface CreateBoardPayload {
  workspaceId: string;
  name: string;
  repositoryName?: string;
  githubRepoId?: string;
}

export interface DeletedBoard {
  id: string;
  name: string;
  workspaceName: string;
  repositoryName: string | null;
  githubRepoId: string | null;
  deletedAt: Date | string;
  daysLeftForPermDeletion: number;
  timeLeftString: string;
}
