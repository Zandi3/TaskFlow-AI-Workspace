import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createLovableAiGatewayProvider, requireApiKey } from "./ai-gateway.server";

const meetingSchema = z.object({
  executiveSummary: z.string(),
  keyDecisions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      owner: z.string(),
      task: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
      deadline: z.string(),
    }),
  ),
});
export type MeetingResult = z.infer<typeof meetingSchema>;

const emailSchema = z.object({
  subjectOptions: z.array(z.string()).min(1),
  body: z.string(),
});
export type EmailResult = z.infer<typeof emailSchema>;

const plannerSchema = z.object({
  matrix: z.object({
    urgentImportant: z.array(z.string()),
    notUrgentImportant: z.array(z.string()),
    urgentNotImportant: z.array(z.string()),
    notUrgentNotImportant: z.array(z.string()),
  }),
  schedule: z.array(
    z.object({
      start: z.string(),
      end: z.string(),
      task: z.string(),
      hours: z.number(),
      focus: z.enum(["Deep work", "Shallow work", "Admin", "Break"]),
    }),
  ),
  notes: z.string(),
});
export type PlannerResult = z.infer<typeof plannerSchema>;

function gateway() {
  return createLovableAiGatewayProvider(requireApiKey());
}

export const summarizeMeeting = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ notes: z.string().min(1).max(20000), objective: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<MeetingResult> => {
    const result = await generateText({
      model: gateway()(CHAT_MODEL),
      output: Output.object({ schema: meetingSchema }),
      system:
        "You turn raw meeting notes into structured output. Only use information present in the notes. Deadlines must be explicit dates or relative phrases from the notes, otherwise 'Not specified'.",
      prompt: `Meeting objective: ${data.objective || "not specified"}\n\nRaw notes / transcript:\n${data.notes}`,
    });
    return result.output;
  });

export const generateEmail = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        points: z.string().min(1).max(8000),
        recipient: z.string().max(200).optional(),
        tone: z.enum(["Formal", "Friendly", "Persuasive", "Assertive"]),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<EmailResult> => {
    const result = await generateText({
      model: gateway()(CHAT_MODEL),
      output: Output.object({ schema: emailSchema }),
      system:
        "You write professional workplace emails. Produce exactly 3 distinct subject line options and one complete email body with greeting, structured paragraphs or bullets, and a sign-off. Do not invent commitments not implied by the bullet points.",
      prompt: `Recipient: ${data.recipient || "not specified"}\nTone: ${data.tone}\n\nKey points:\n${data.points}`,
    });
    return result.output;
  });

export const planTasks = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ tasks: z.string().min(1).max(8000), hoursPerDay: z.number().min(1).max(16) }).parse(input),
  )
  .handler(async ({ data }): Promise<PlannerResult> => {
    const result = await generateText({
      model: gateway()(CHAT_MODEL),
      output: Output.object({ schema: plannerSchema }),
      system:
        "You are a scheduling assistant. Categorise tasks into the Eisenhower matrix and build a realistic time-blocked day. Total scheduled work hours (excluding breaks) must not exceed the given daily limit. Use 24h HH:MM times starting at 09:00 unless the input says otherwise.",
      prompt: `Daily working hours limit: ${data.hoursPerDay}\n\nUnorganised tasks:\n${data.tasks}`,
    });
    return result.output;
  });
