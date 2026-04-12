import { NormalAction } from "../types/commands";

export const NORMAL_ACTIONS_REGISTRY: Record<string, NormalAction> = {
  j: {
    key: "j",
    description: "Scroll down",
    action: () => {
      window.scrollBy({ top: 100, behavior: "smooth" });
    },
  },
  k: {
    key: "k",
    description: "Scroll up",
    action: () => {
      window.scrollBy({ top: -100, behavior: "smooth" });
    },
  },
  gg: {
    key: "gg",
    description: "Go to top",
    action: () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
  G: {
    key: "G",
    description: "Go to bottom",
    action: () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    },
  },
};
