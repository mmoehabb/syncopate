import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@syncopate/db";
import stringSimilarity from "string-similarity";
import { TaskStatus } from "@prisma/client";
import { PullRequestEvent } from "@octokit/webhooks-types";

function verifySignature(req: NextRequest, bodyText: string) {
  const signature = req.headers.get("x-hub-signature-256");
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret || !signature) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = `sha256=${hmac.update(bodyText).digest("hex")}`;

  try {
    const sigBuf = Buffer.from(signature);
    const digestBuf = Buffer.from(digest);
    if (sigBuf.length !== digestBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, digestBuf);
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();

    if (!verifySignature(req, bodyText)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    const event = req.headers.get("x-github-event");

    if (event !== "pull_request") {
      return NextResponse.json({ message: "Ignored event type" });
    }

    const prEvent = payload as PullRequestEvent;

    const action = prEvent.action;
    const pr = prEvent.pull_request;
    const repo = prEvent.repository;

    if (!pr || !repo) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const repoIdStr = String(repo.id);

    const board = await prisma.board.findFirst({
      where: { githubRepoId: repoIdStr },
    });

    if (!board) {
      return NextResponse.json({ message: "Board not found for repo" });
    }

    let status: TaskStatus = "TODO";

    if (pr.draft) {
      status = "TODO";
    } else if (action === "opened") {
      status = "IN_PROGRESS";
    } else if (action === "review_requested") {
      status = "IN_REVIEW";
    } else if (action === "closed") {
      if (pr.merged) {
        status = "DONE";
      } else {
        status = "CLOSED";
      }
    } else if (action === "reopened") {
      status = "IN_PROGRESS";
    }

    // See if task with this PR already exists
    const existingTask = await prisma.task.findFirst({
      where: {
        boardId: board.id,
        prNumber: pr.number,
      },
    });

    if (existingTask) {
      await prisma.task.update({
        where: { id: existingTask.id },
        data: {
          title: pr.title,
          description: pr.body || "",
          status: status,
          branchName: pr.head.ref,
        },
      });
      return NextResponse.json({ message: "Task updated" });
    }

    // Action is created/opened, try to find 90% matching unlinked task
    if (action === "opened") {
      const unlinkedTasks = await prisma.task.findMany({
        where: {
          boardId: board.id,
          prNumber: null,
        },
      });

      if (unlinkedTasks.length > 0) {
        const titles = unlinkedTasks.map((t) => t.title);
        const match = stringSimilarity.findBestMatch(pr.title, titles);

        if (match.bestMatch.rating >= 0.9) {
          const matchedTask = unlinkedTasks[match.bestMatchIndex];
          await prisma.task.update({
            where: { id: matchedTask.id },
            data: {
              prNumber: pr.number,
              branchName: pr.head.ref,
              description: matchedTask.description || pr.body || "",
              status: status,
            },
          });
          return NextResponse.json({ message: "Task linked and updated" });
        }
      }
    }

    // Otherwise create a new task
    await prisma.task.create({
      data: {
        boardId: board.id,
        title: pr.title,
        description: pr.body || "",
        status: status,
        prNumber: pr.number,
        branchName: pr.head.ref,
      },
    });

    return NextResponse.json({ message: "Task created" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
