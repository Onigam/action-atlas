# Default Prompt - Next Issue Implementation

Copy and paste this prompt to start working on the next GitHub issue:

---

Please help me implement the next issue in this project:

1. **Read the project agents**: Check `.claude/agents/` to understand the agent list
2. **Find the next GitHub issue**: Look at the open issues in this repository and identify the next one to work on based on milestone priority (lowest milestone first, then by priority label, then by the issue number). Use gh command.
3. **Execute the agent chain**: Based on the issue requirements, automatically invoke and execute the appropriate specialized agents using @agent-organizer. Do NOT wait for my approval between agents - chain or parallelize them automatically.

## Agent Chaining / parallelizing Rules

- **Execute agents**: Complete each agent's task before moving to the next or aggregate the parallel executions
- **Chain automatically**: Do not pause for user confirmation between sequences
- **Use specialized agents for finalization**:
  - @code-reviewer: Validates implementation quality, security, and best practices
  - @git-workflow-manager: Creates commits and PRs with proper formatting
- **Report progress**: Briefly indicate which agent is being invoked and what it's doing

## Expected Flow

```
Issue Analysis with @agent-organizer → Agents executes → ... → @code-reviewer (validation) → @git-workflow-manager (PR) → PR Created
```

## Example Agent Chains (Sequential)

| Issue Type | Agent Chain |
|------------|-------------|
| Website/Frontend | @agent-organizer → @ui-designer → @frontend-developer → @code-reviewer → @git-workflow-manager |
| Backend API | @agent-organizer → @backend-developer → @code-reviewer → @git-workflow-manager |
| CI/CD | @agent-organizer → @devops-engineer → @deployment-engineer → @code-reviewer → @git-workflow-manager |
| Bug Fix | @agent-organizer → @frontend-developer or @backend-developer → @code-reviewer → @git-workflow-manager |

## Example Parallelized Flows

When tasks are independent and don't depend on each other's output, run agents in parallel:

| Issue Type | Parallel Flow |
|------------|---------------|
| Full-Stack Feature | @agent-organizer → [@frontend-developer ∥ @backend-developer] → @code-reviewer → @git-workflow-manager |
| Multi-Service Update | @agent-organizer → [@devops-engineer ∥ @deployment-engineer] → @code-reviewer → @git-workflow-manager |
| Design + Docs | @agent-organizer → [@ui-designer ∥ @research-analyst] → @frontend-developer → @code-reviewer → @git-workflow-manager |
| Complex Feature | @agent-organizer → @architect-reviewer → [@frontend-developer ∥ @backend-developer ∥ @devops-engineer] → @code-reviewer → @git-workflow-manager |

**Legend**: `[A ∥ B]` means A and B run in parallel

### When to Parallelize

- **DO parallelize**: Independent components (frontend + backend), separate services, non-blocking research tasks
- **DON'T parallelize**: When one agent's output is another's input (e.g., design must complete before frontend implementation)

The final output should be a PR URL ready for review.
