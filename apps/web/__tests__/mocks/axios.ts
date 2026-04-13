import { mock } from "bun:test";

export const mockAxiosInstance = {
  post: mock(),
  get: mock(),
  patch: mock(),
  delete: mock(),
  interceptors: {
    response: {
      use: mock(),
    },
  },
};

mock.module("axios", () => {
  return {
    default: {
      create: () => mockAxiosInstance,
    },
  };
});
