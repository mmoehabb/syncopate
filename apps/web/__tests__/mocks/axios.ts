import { mock } from "bun:test";

export const mockAxiosInstance = {
  post: mock(),
  get: mock(),
  put: mock(),
  patch: mock(),
  delete: mock(),
  interceptors: {
    response: {
      use: mock(() => {}),
    },
  },
};

// Return promises with required structure. By default these will resolve with empty objects if not overridden.
mockAxiosInstance.post.mockImplementation(() => Promise.resolve({ data: {} }));
mockAxiosInstance.get.mockImplementation(() => Promise.resolve({ data: {} }));
mockAxiosInstance.put.mockImplementation(() => Promise.resolve({ data: {} }));
mockAxiosInstance.patch.mockImplementation(() => Promise.resolve({ data: {} }));
mockAxiosInstance.delete.mockImplementation(() =>
  Promise.resolve({ data: {} }),
);

// In bun:test, mocking entire modules must match the export shape exactly.
mock.module("axios", () => {
  return {
    default: {
      create: mock(() => mockAxiosInstance),
    },
    create: mock(() => mockAxiosInstance),
  };
});
