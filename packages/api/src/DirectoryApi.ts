import { ApiClient } from "./ApiClient";
import type { DirectoryResponse } from "@syncopate/types";

export class DirectoryApi extends ApiClient {
  constructor(baseURL?: string) {
    super(baseURL ? `${baseURL}/api/directory` : "/api/directory");
  }

  public async getDirectory(path: string): Promise<DirectoryResponse> {
    const response = await this.get<DirectoryResponse>("", {
      params: { path },
    });
    return response.data;
  }
}

export const directoryApi = new DirectoryApi();
