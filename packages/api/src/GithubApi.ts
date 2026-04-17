import { ApiClient } from "./ApiClient";
import type { GithubRepo } from "@syncopate/types";

export class GithubApi extends ApiClient {
  constructor() {
    super("/api/github");
  }

  public async getRepos(workspaceId?: string): Promise<GithubRepo[]> {
    const params = new URLSearchParams();
    if (workspaceId) {
      params.append("workspaceId", workspaceId);
    }
    const response = await this.get<{ repos: GithubRepo[] }>(
      `/repos?${params.toString()}`,
    );
    return response.data.repos;
  }
}

export const githubApi = new GithubApi();
