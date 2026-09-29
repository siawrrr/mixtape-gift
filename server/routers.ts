import { COOKIE_NAME } from "@shared/const";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createCassette, deleteCassette, getCassetteByShareToken, listCassettesByOwner } from "./db";

const jsonValue = z.unknown();
const cassetteInput = z.object({
  id: z.string().min(1).max(36),
  title: z.string().trim().min(1).max(180),
  recipient: z.string().max(120).default(""),
  sender: z.string().max(120).default(""),
  letter: z.string().max(12000).default(""),
  body: jsonValue,
  songs: z.array(jsonValue).max(12),
  decorations: z.array(jsonValue).max(80),
  effects: z.array(jsonValue).max(20),
  background: z.string().max(64).default("desk"),
});

function decodeJson(value: string, fallback: unknown) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function presentCassette(row: Awaited<ReturnType<typeof getCassetteByShareToken>>) {
  if (!row) return null;
  return {
    id: row.id,
    shareToken: row.shareToken,
    title: row.title,
    recipient: row.recipient,
    sender: row.sender,
    letter: row.letter,
    body: decodeJson(row.bodyJson, {}),
    songs: decodeJson(row.songsJson, []),
    decorations: decodeJson(row.decorationsJson, []),
    effects: decodeJson(row.effectsJson, []),
    background: row.background,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  cassettes: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const rows = await listCassettesByOwner(ctx.user.id);
      return rows.map((row) => presentCassette(row)).filter(Boolean);
    }),
    byShareToken: publicProcedure
      .input(z.object({ shareToken: z.string().min(8).max(32) }))
      .query(async ({ input }) => {
        const row = await getCassetteByShareToken(input.shareToken);
        return presentCassette(row);
      }),
    create: protectedProcedure.input(cassetteInput).mutation(async ({ ctx, input }) => {
      const now = new Date();
      const row = await createCassette({
        id: input.id,
        ownerId: ctx.user.id,
        shareToken: nanoid(12),
        title: input.title,
        recipient: input.recipient,
        sender: input.sender,
        letter: input.letter,
        bodyJson: JSON.stringify(input.body),
        songsJson: JSON.stringify(input.songs),
        decorationsJson: JSON.stringify(input.decorations),
        effectsJson: JSON.stringify(input.effects),
        background: input.background,
        createdAt: now,
        updatedAt: now,
      });
      return presentCassette(row);
    }),
    remove: protectedProcedure.input(z.object({ id: z.string().min(1).max(36) })).mutation(async ({ ctx, input }) => deleteCassette(input.id, ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
