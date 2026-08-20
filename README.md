# AI Task Flow

Create a complete, fully functional workplace productivity dashboard named 'TaskFlow AI' using React, Tailwind CSS, Lucide icons, and Shadcn UI.

1. Layout & Theme:

- Dark/light mode support with a toggle.

- Collapsible left sidebar with navigation for 4 tabs: Meeting Summarizer, Smart Email Generator, AI Task Planner, and Workplace Assistant Chatbot.

- Persistent top Responsible AI banner: "AI outputs are generated automatically and may contain inaccuracies. Human review is required before sending or scheduling."

2. Tab 1 - Meeting Notes Summarizer:

- Input: Textarea for raw notes/transcripts + objective field.

- AI Action: Call the built-in AI gateway to parse the notes into: 1) Executive Summary, 2) Key Decisions list, 3) Action Items Table (columns: Owner, Task, Priority, Deadline).

- Add loading skeletons and error toasts.

3. Tab 2 - Smart Email Generator:

- Input: Key bullet points, recipient field, and a tone selector dropdown (Formal, Friendly, Persuasive, Assertive).

- AI Action: Generate 3 selectable subject line options, a formatted editable email draft body, and a working 'Copy to Clipboard' button with success toast.

4. Tab 3 - AI Task Planner / Scheduler:

- Input: Textarea for unorganized tasks with deadlines and an hours/day limit slider.

- AI Action: Categorize tasks into a 2x2 Eisenhower Matrix grid (Urgent/Important) and generate a time-blocked daily schedule table with a total hours counter.

5. Tab 4 - Workplace Assistant Chatbot:

- Full streaming conversational chat interface with conversation history, markdown formatting, and 3 clickable starter prompt chips ("Draft a status update", "Prioritize my day", "Summarize action items").

Ensure all 4 tabs use real AI generations via Lovable's built-in AI, have responsive dual-pane desktop layouts, and include client-side warning validation if users type sensitive patterns like passwords or credit cards.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e4b5550a-8a44-4e94-85c7-2358fc8d7e7a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
