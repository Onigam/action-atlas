# Event for Good

A platform to help event organizers discover activities proposed by non-profit organizations and easily find the necessary contacts to organize impactful events.

## Project Vision

This project follows a clear, documented product vision. All development decisions should align with the goals, scope, and principles outlined in:

**→ [docs/product-vision.md](docs/product-vision.md)**

Before working on any feature or making architectural decisions, consult the product vision document to ensure alignment.

## Development with AI Agents

This project is structured for agent-based development, where specialized AI agents handle different aspects of the software development lifecycle. This approach ensures consistency, maintains clear boundaries, and preserves the product vision across all work.

### Available Agents

Each agent has a specific role and defined responsibilities:

- **[Product Manager](subagents/product-manager.md)** - Product strategy, requirements, prioritization
- **[Software Architect](subagents/software-architect.md)** - System design, technology decisions, architecture
- **[Backend Engineer](subagents/backend-engineer.md)** - Server-side implementation, APIs, database
- **[Frontend Engineer](subagents/frontend-engineer.md)** - UI/UX implementation, client-side logic
- **[QA Engineer](subagents/qa-engineer.md)** - Testing, quality assurance, bug identification

### How to Invoke an Agent

When working with AI assistants (like Claude Code), you can invoke an agent using the `@agent-name` pattern:

```
@product-manager: Should we add a favorites feature to the MVP?

@software-architect: Design the data model for activities and organizations

@backend-engineer: Implement the GET /api/activities endpoint with filtering

@frontend-engineer: Build the activity discovery page

@qa-engineer: Test the filtering functionality on the activities page
```

### Rules for Working with Agents

1. **One Task at a Time**
   - Give each agent a clear, focused task
   - Wait for completion before moving to the next task
   - Don't ask one agent to do another agent's job

2. **Explicit Goals**
   - Be specific about what you want
   - Provide context when necessary
   - Reference requirements or user stories if available

3. **Vision Alignment**
   - Agents will automatically consult `docs/product-vision.md`
   - If an agent flags a conflict with the vision, address it
   - Trust agents to push back on out-of-scope requests

4. **Sequential Workflow**
   - Follow natural development flow:
     1. Product Manager defines requirements
     2. Software Architect designs solution
     3. Engineers implement
     4. QA Engineer tests
   - You can iterate or go back as needed

5. **Agent Autonomy**
   - Agents can make decisions within their domain
   - They will ask when they need your input
   - Review their "Autonomous Decision Authority" in their definitions

### Example Workflow

```
# 1. Define the feature
@product-manager: We need to let organizers browse activities by location.
What should this look like?

# 2. Design the solution
@software-architect: Design the API and data model for location-based filtering

# 3. Implement backend
@backend-engineer: Implement the location filtering in the activities API

# 4. Implement frontend
@frontend-engineer: Add location filter UI to the activities page

# 5. Test the feature
@qa-engineer: Test location filtering end-to-end
```

### Product Vision is the Source of Truth

**CRITICAL**: Every agent references `docs/product-vision.md` before making decisions.

- ✅ **Do**: Propose changes that align with MVP scope and product principles
- ✅ **Do**: Flag features that conflict with documented non-goals
- ✅ **Do**: Suggest updates to the vision if you identify gaps
- ❌ **Don't**: Add features marked as "out-of-scope" without updating the vision first
- ❌ **Don't**: Make decisions that contradict guiding principles
- ❌ **Don't**: Skip reading the vision document

If you want to change direction, update `docs/product-vision.md` first, then proceed with implementation.

## Project Structure

```
action-atlas/
├── docs/
│   └── product-vision.md          # Product strategy and MVP scope
├── subagents/
│   ├── product-manager.md         # Product agent definition
│   ├── software-architect.md      # Architecture agent definition
│   ├── backend-engineer.md        # Backend agent definition
│   ├── frontend-engineer.md       # Frontend agent definition
│   └── qa-engineer.md             # QA agent definition
└── README.md                      # This file
```

## Getting Started

1. **Read the product vision**: Start with [docs/product-vision.md](docs/product-vision.md)
2. **Understand the agents**: Review agent definitions in `subagents/`
3. **Choose your first task**: Pick a feature from the MVP scope
4. **Invoke the right agent**: Start with `@product-manager` for requirements
5. **Follow the workflow**: PM → Architect → Engineer → QA

## Contributing

This is currently a solo developer project with potential to become open-source. When contributing:

- Always consult the product vision first
- Use the agent system for structured development
- Keep changes focused and aligned with MVP scope
- Prioritize simplicity and maintainability
- Document decisions and rationale

## Tech Stack

_To be determined by Software Architect based on product requirements_

## License

_To be determined_
