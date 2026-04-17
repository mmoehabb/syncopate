import { ApiClient } from "./ApiClient";
import { AxiosRequestConfig } from "axios";
import { TaskStatus } from "@syncopate/db";
import type { Task } from "@syncopate/db";
import type {
  CreateTaskPayload,
  UpdateTaskStatusPayload,
} from "@syncopate/types";

export class TaskApi extends ApiClient {
  constructor(baseURL?: string) {
    super(baseURL ? `${baseURL}/api/tasks` : "/api/tasks");
  }

  public async addTask(
    payload: CreateTaskPayload,
    config?: AxiosRequestConfig,
  ): Promise<Task> {
    const response = await this.post<{ task: Task }>("", payload, config);
    return response.data.task;
  }

  public async updateTaskStatus(
    taskId: string,
    status: TaskStatus | string,
    config?: AxiosRequestConfig,
  ): Promise<Task> {
    const response = await this.patch<{ task: Task }>(
      `/${taskId}`,
      { status },
      config,
    );
    return response.data.task;
  }

  public async deleteTask(
    taskId: string,
    config?: AxiosRequestConfig,
  ): Promise<{ success: boolean }> {
    const response = await this.delete<{ success: boolean }>(
      `/${taskId}`,
      config,
    );
    return response.data;
  }
}

export const taskApi = new TaskApi();
