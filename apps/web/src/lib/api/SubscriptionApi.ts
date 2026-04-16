import { ApiClient } from "./ApiClient";
import { AxiosRequestConfig } from "axios";
import type { Subscription } from "@prisma/client";

export class SubscriptionApi extends ApiClient {
  constructor(baseURL?: string) {
    super(baseURL ? `${baseURL}/api/subscriptions` : "/api/subscriptions");
  }

  public async subscribeToFreePlan(
    config?: AxiosRequestConfig,
  ): Promise<Subscription> {
    const response = await this.post<{ subscription: Subscription }>(
      "",
      {},
      config,
    );
    return response.data.subscription;
  }
}

export const subscriptionApi = new SubscriptionApi();
