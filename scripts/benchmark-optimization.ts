import { PrismaClient } from "@prisma/client";

// Mocking Prisma Client for benchmarking since a real DB might not be available or stable
class MockPrismaClient {
  board = {
    findMany: async () => {
      // Simulate finding 100 boards
      return Array.from({ length: 100 }, (_, i) => ({ id: `board-${i}` }));
    },
    updateMany: async () => {
      return { count: 100 };
    },
  };
}

async function benchmark() {
  const mockPrisma = new MockPrismaClient();
  const userId = "test-user";
  const iterations = 10000;

  console.log(`Running benchmark with ${iterations} iterations...`);

  // Current pattern
  const startCurrent = performance.now();
  for (let i = 0; i < iterations; i++) {
    const boardsToDeactivate = await mockPrisma.board.findMany();
    if (boardsToDeactivate.length > 0) {
      await mockPrisma.board.updateMany();
    }
  }
  const endCurrent = performance.now();
  const timeCurrent = endCurrent - startCurrent;

  // Optimized pattern (simulated)
  const startOptimized = performance.now();
  for (let i = 0; i < iterations; i++) {
    await mockPrisma.board.updateMany();
  }
  const endOptimized = performance.now();
  const timeOptimized = endOptimized - startOptimized;

  console.log(`Current pattern: ${timeCurrent.toFixed(2)}ms`);
  console.log(`Optimized pattern: ${timeOptimized.toFixed(2)}ms`);
  console.log(`Improvement: ${(((timeCurrent - timeOptimized) / timeCurrent) * 100).toFixed(2)}%`);

  // Note: This benchmark is mostly showing the overhead of the extra promise and array mapping in JS.
  // In a real DB scenario, the reduction in round-trips and DB-side optimization would be even more significant.
}

benchmark();
