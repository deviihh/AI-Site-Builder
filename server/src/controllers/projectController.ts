import { Request, Response } from "express";
import prisma from "../lib/prisma";
import openai from "../lib/openai";
import { ENHANCE_PROMPT, CODE_PROMPT, REVISE_PROMPT, cleanCode } from "../lib/prompts";
import { resolveImagePlaceholders } from "../lib/images";

const CREATION_COST = 5;
const REVISION_COST = 5;
const MAX_ATTEMPTS = 3;
const STALE_MS = 12 * 60 * 1000; // a job older than this is treated as dead
// Models are tried in this order: attempt 1 uses the first, attempt 2 the second, and so on.
const MODELS = (process.env.AI_MODELS || process.env.AI_MODEL || "openrouter/free")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const MODEL = MODELS[0];

type LastMessage = { role: string; timestamp: Date } | null | undefined;

// A project is "busy" while the AI is still working on it.
const isBusy = (last: LastMessage, hasCode: boolean) => {
  if (!last || last.role === "error") return false;
  if (Date.now() - last.timestamp.getTime() > STALE_MS) return false;
  return last.role === "user" || !hasCode;
};

const getLastMessage = (projectId: string) =>
  prisma.conversation.findFirst({
    where: { projectId },
    orderBy: [{ timestamp: "desc" }, { id: "desc" }],
  });

// Asks the AI for a full HTML page. Retries when the answer is broken.
const askForCode = async (systemPrompt: string, userContent: string, label: string): Promise<string> => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[${label}] Code attempt ${attempt}/${MAX_ATTEMPTS}...`);
      const res = await openai.chat.completions.create(
        {
          model: MODELS[(attempt - 1) % MODELS.length],
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        },
        { timeout: 120000 } // was 45000 — too short for a full HTML page; raised to 2 min
      );

      // Guard against a malformed/error-shaped response instead of crashing on res.choices[0]
      if (!res?.choices?.length) {
        console.log(`[${label}] Attempt ${attempt}: malformed response: ${JSON.stringify(res)}`);
        continue;
      }

      const raw = res.choices[0]?.message?.content || "";
      const code = cleanCode(raw);
      console.log(`[${label}] Attempt ${attempt}: model ${res.model}, length ${raw.length}, valid ${code ? "yes" : "no"}`);
      if (code) {
        const resolvedCode = await resolveImagePlaceholders(code);
        return resolvedCode;
      }
    } catch (error: any) {
      console.log(`[${label}] Attempt ${attempt} error: ${error.message}`);
    }
  }
  throw new Error(`The AI could not produce a complete page after ${MAX_ATTEMPTS} attempts`);
};

const failAndRefund = async (projectId: string, userId: string, cost: number, reason: string) => {
  console.log(`[${projectId}] Failed: ${reason}`);
  try {
    await prisma.conversation.create({
      data: { role: "error", content: "Something went wrong and your credits were refunded. Please try again.", projectId },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: cost } },
    });
  } catch (refundError: any) {
    console.log("Refund failed:", refundError.message);
  }
};

// Background job for a new project. It must never throw.
const generateWebsite = async (projectId: string, userId: string, userPrompt: string) => {
  const startedAt = Date.now();
  try {
    // 1. Enhance the prompt (if this fails we just use the original prompt)
    let enhancedPrompt = userPrompt;
    try {
      console.log(`[${projectId}] Enhancing prompt...`);
      const enhanceRes = await openai.chat.completions.create(
        {
          model: MODEL,
          messages: [
            { role: "system", content: ENHANCE_PROMPT },
            { role: "user", content: userPrompt },
          ],
        },
        { timeout: 15000 }
      );
      const text = enhanceRes.choices?.[0]?.message?.content?.trim();
      if (text) {
        enhancedPrompt = text;
        await prisma.conversation.create({
          data: { role: "assistant", content: `I have enhanced your prompt to: "${text}"`, projectId },
        });
      }
    } catch (error: any) {
      console.log(`[${projectId}] Prompt enhancement skipped: ${error.message}`);
    }

    await prisma.conversation.create({
      data: { role: "assistant", content: "Now generating your website...", projectId },
    });

    // 2. Generate the code (with retries)
    const code = await askForCode(CODE_PROMPT, enhancedPrompt, projectId);

    // 3. Save version 1
    const version = await prisma.version.create({
      data: { code, description: "Initial version", projectId },
    });
    await prisma.conversation.create({
      data: { role: "assistant", content: "I have created your website. You can now preview it and request changes.", projectId },
    });
    await prisma.websiteProject.update({
      where: { id: projectId },
      data: { currentCode: code, currentVersionIndex: version.id },
    });
    console.log(`[${projectId}] Website saved in ${Math.round((Date.now() - startedAt) / 1000)}s`);
  } catch (error: any) {
    await failAndRefund(projectId, userId, CREATION_COST, error.message);
  }
};

// Background job for a revision. It must never throw.
const reviseWebsite = async (projectId: string, userId: string, message: string, currentCode: string) => {
  const startedAt = Date.now();
  try {
    const code = await askForCode(
      REVISE_PROMPT,
      `Current website code:\n${currentCode}\n\nRequested change:\n${message}`,
      projectId
    );

    const version = await prisma.version.create({
      data: {
        code,
        description: message.length > 100 ? message.substring(0, 97) + "..." : message,
        projectId,
      },
    });
    await prisma.conversation.create({
      data: { role: "assistant", content: "I have made the changes to your website. You can now preview it.", projectId },
    });
    await prisma.websiteProject.update({
      where: { id: projectId },
      data: { currentCode: code, currentVersionIndex: version.id },
    });
    console.log(`[${projectId}] Revision saved in ${Math.round((Date.now() - startedAt) / 1000)}s`);
  } catch (error: any) {
    await failAndRefund(projectId, userId, REVISION_COST, error.message);
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const prompt = String(req.body.prompt || "").trim();
    if (!prompt) {
      return res.status(400).json({ message: "Please enter a prompt" });
    }
    if (prompt.length > 2000) {
      return res.status(400).json({ message: "Prompt is too long (maximum 2000 characters)" });
    }

    const name = prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt;

    // Deduct credits and create the project in ONE transaction (all or nothing).
    const project = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { id: userId, credits: { gte: CREATION_COST } },
        data: { credits: { decrement: CREATION_COST }, totalCreation: { increment: 1 } },
      });
      if (updated.count === 0) {
        return null;
      }
      const created = await tx.websiteProject.create({
        data: { name, initialPrompt: prompt, userId },
      });
      await tx.conversation.create({
        data: { role: "user", content: prompt, projectId: created.id },
      });
      return created;
    });

    if (!project) {
      return res.status(403).json({ message: "Not enough credits. You need 5 credits to create a website." });
    }

    // Reply now, keep working in the background.
    res.status(201).json({ projectId: project.id });
    generateWebsite(project.id, userId, prompt).catch((e) => console.log(e));
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = String(req.params.projectId);
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
      include: {
        conversation: { orderBy: [{ timestamp: "asc" }, { id: "asc" }] },
        versions: { orderBy: [{ timestamp: "asc" }, { id: "asc" }] },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const last = project.conversation[project.conversation.length - 1];
    res.json({ project, isGenerating: isBusy(last, !!project.currentCode) });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await prisma.websiteProject.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        conversation: { orderBy: [{ timestamp: "desc" }, { id: "desc" }], take: 1 },
      },
    });
    res.json({
      projects: projects.map(({ conversation, ...project }) => ({
        ...project,
        isGenerating: isBusy(conversation[0], !!project.currentCode),
      })),
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const makeRevision = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = String(req.params.projectId);
    const message = String(req.body.message || "").trim();
    if (!message) {
      return res.status(400).json({ message: "Please describe the change you want" });
    }
    if (message.length > 2000) {
      return res.status(400).json({ message: "Message is too long (maximum 2000 characters)" });
    }

    const project = await prisma.websiteProject.findFirst({ where: { id: projectId, userId } });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!project.currentCode) {
      return res.status(409).json({ message: "This website has no code yet. Wait for it to finish or create a new one." });
    }

    // Check busy status AND write the new message inside the SAME transaction,
    // so two near-simultaneous requests can't both pass the check before either writes.
    const result = await prisma.$transaction(async (tx) => {
      const last = await tx.conversation.findFirst({
        where: { projectId },
        orderBy: [{ timestamp: "desc" }, { id: "desc" }],
      });
      if (isBusy(last, true)) {
        return "busy" as const;
      }

      const updated = await tx.user.updateMany({
        where: { id: userId, credits: { gte: REVISION_COST } },
        data: { credits: { decrement: REVISION_COST } },
      });
      if (updated.count === 0) {
        return "no_credits" as const;
      }

      await tx.conversation.create({
        data: { role: "user", content: message, projectId },
      });
      return "ok" as const;
    });

    if (result === "busy") {
      return res.status(409).json({ message: "Your website is still being updated. Please wait a moment." });
    }
    if (result === "no_credits") {
      return res.status(403).json({ message: "Not enough credits. You need 5 credits to make changes." });
    }

    res.json({ message: "Working on your changes" });
    reviseWebsite(projectId, userId, message, project.currentCode).catch((e) => console.log(e));
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const rollbackToVersion = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = String(req.params.projectId);
    const versionId = String(req.params.versionId);

    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
      include: { versions: true },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const last = await getLastMessage(projectId);
    if (isBusy(last, !!project.currentCode)) {
      return res.status(409).json({ message: "Your website is still being updated. Please wait a moment." });
    }

    const version = project.versions.find((v) => v.id === versionId);
    if (!version) {
      return res.status(404).json({ message: "Version not found" });
    }

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: { currentCode: version.code, currentVersionIndex: version.id },
    });
    await prisma.conversation.create({
      data: { role: "assistant", content: "I have rolled back your website to the selected version.", projectId },
    });

    res.json({ message: "Version rolled back" });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const togglePublish = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = String(req.params.projectId);
    const project = await prisma.websiteProject.findFirst({ where: { id: projectId, userId } });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!project.currentCode) {
      return res.status(400).json({ message: "Generate the website before publishing" });
    }

    const updated = await prisma.websiteProject.update({
      where: { id: projectId },
      data: { isPublished: !project.isPublished },
    });

    res.json({
      isPublished: updated.isPublished,
      message: updated.isPublished ? "Project published" : "Project unpublished",
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = String(req.params.projectId);
    // Conversation and Version rows are removed automatically (onDelete: Cascade in the schema).
    const result = await prisma.websiteProject.deleteMany({ where: { id: projectId, userId } });
    if (result.count === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted" });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ---------- Public (no login needed) ----------

export const getPublishedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.websiteProject.findMany({
      where: { isPublished: true, currentCode: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        initialPrompt: true,
        currentCode: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
    res.json({ projects });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getPublishedProject = async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.projectId);
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, isPublished: true },
      select: { id: true, name: true, currentCode: true },
    });
    if (!project || !project.currentCode) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ name: project.name, code: project.currentCode });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};