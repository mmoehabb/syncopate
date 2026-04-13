import { mock } from "bun:test";

export const mockAxiosInstance = {
  post: mock(),
  get: mock(),
  patch: mock(),
  delete: mock(),
  interceptors: {
    response: {
      use: mock(() => {}),
    },
  },
};

const mockAxios = {
  create: mock(() => mockAxiosInstance),
};

mock.module("axios", () => ({
  ...mockAxios,
  default: mockAxios,
}));
