import { ApiClient } from "./ApiClient";

export interface GithubRepo {
  id: number;
  name: string;
  url: string;
  private: boolean;
}

export class GithubApi extends ApiClient {
  constructor() {
    super("/api/github");
  }

  public async getRepos(): Promise<GithubRepo[]> {
    const response = await this.get<{ repos: GithubRepo[] }>("/repos");
    return response.data.repos;
  }
}

export const githubApi = new GithubApi();
