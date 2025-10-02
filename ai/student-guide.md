# 📚 Student Guide: Using AI Assistants for Learning Web API Development

## 🎯 Learning Philosophy: Learn, Don't Just Copy

Welcome to TCSS 460! This guide will help you use AI assistants (like ChatGPT, Claude, GitHub Copilot, etc.) **effectively** for learning while maintaining academic integrity and actually building your skills.

### The Golden Rule
> **AI should be your tutor, not your ghostwriter.**

The goal of this course is for **YOU** to understand Web APIs, HTTP, Node.js, Express, and TypeScript. AI can help you learn faster and more effectively, but only if you use it as a learning tool rather than a shortcut.

---

## ✅ Good Uses of AI

### 1. **Explaining Concepts** 📖
**Good:** "Explain what middleware is in Express and why we use it"
**Why it's good:** You're building foundational understanding

**Example Session:**
```
You: "I see middleware being used in our routes. Can you explain what
     middleware is and how it fits into the request/response cycle?"

AI: [Explains middleware concept with examples]

You: "So if I wanted to log every request, would I create middleware
     for that? Can you show me a simple example?"

AI: [Shows logging middleware example]

You: "Got it! Let me try to write my own middleware that adds a
     timestamp to each request..."
```

### 2. **Understanding Code** 🔍
**Good:** "Walk me through this code line by line and explain what each part does"
**Why it's good:** You're actively learning from existing code

**Example:**
```
You: "I'm looking at the createMessage controller. Can you explain
     why we check if the name exists before inserting?"

AI: [Explains duplicate checking logic]

You: "What would happen if we didn't do that check? Would the
     database throw an error because of the UNIQUE constraint?"

AI: [Explains database constraints and error handling]
```

### 3. **Debugging Help** 🐛
**Good:** "I'm getting this error: [paste error]. Here's my code: [paste code]. What might be causing this?"
**Why it's good:** You're learning to read errors and fix problems

**Example:**
```
You: "I'm getting 'Cannot find module @utilities/database' but the
     file exists. Here's my import and my tsconfig.json..."

AI: [Explains path alias configuration]

You: "Ah! So I need to restart ts-node after changing tsconfig?
     Let me try that..."
```

### 4. **Learning Best Practices** 🌟
**Good:** "What's the best way to handle errors in async Express controllers?"
**Why it's good:** You're learning professional patterns

### 5. **Exploring Alternatives** 🔄
**Good:** "I wrote this validation code. Is there a more readable way to do this?"
**Why it's good:** You're refining your initial solution

### 6. **Understanding Error Messages** ⚠️
**Good:** "TypeScript says 'Property does not exist on type'. What does this mean?"
**Why it's good:** You're learning to interpret feedback

### 7. **Clarifying Documentation** 📄
**Good:** "The express-validator docs mention 'validation chains'. What are those?"
**Why it's good:** You're supplementing official documentation

### 8. **Testing Strategy** 🧪
**Good:** "What should I test in the createMessage controller? Help me think through test cases."
**Why it's good:** You're learning testing methodology

---

## ❌ Bad Uses of AI (Don't Do This!)

### 1. **Generating Complete Solutions** 🚫
**Bad:** "Write the complete updateMessage controller for me"
**Why it's bad:** You learn nothing and violate academic integrity

**Instead, try:**
- "What steps should I consider when updating a database record?"
- "Help me understand the pattern used in other controllers"
- "I wrote this updateMessage controller. Can you review it and suggest improvements?"

### 2. **Copy-Pasting Without Understanding** 🚫
**Bad:** Getting AI code and submitting it without understanding how it works
**Why it's bad:** You'll fail when asked to explain or modify it

**Instead, try:**
- Ask AI to explain the code it generates
- Rewrite it in your own style
- Test your understanding by modifying it

### 3. **Avoiding Struggle** 🚫
**Bad:** Asking AI at the first sign of difficulty
**Why it's bad:** Struggle is where learning happens

**Instead, try:**
- Spend 15-30 minutes trying on your own first
- Read error messages carefully
- Check the project documentation in `/docs`
- THEN ask AI for guidance (not answers)

### 4. **Skipping Documentation** 🚫
**Bad:** Only using AI and never reading official docs
**Why it's bad:** You miss important context and details

**Instead, try:**
- Read the docs first
- Use AI to clarify what you don't understand
- Ask AI to show practical examples of documented features

### 5. **Not Testing Your Understanding** 🚫
**Bad:** Moving on immediately after getting an AI answer
**Why it's bad:** You haven't verified you actually learned it

**Instead, try:**
- Explain the concept back to the AI in your own words
- Try to implement a variation yourself
- Break something intentionally and fix it

---

## 🎓 Academic Integrity Guidelines

### What's Allowed ✅

1. **Using AI to explain concepts** - Understanding middleware, HTTP, REST, etc.
2. **Getting help debugging** - Understanding error messages and finding bugs
3. **Learning coding patterns** - Understanding how to structure controllers, routes, etc.
4. **Reviewing your own code** - Getting feedback on code you wrote
5. **Understanding project architecture** - Learning how the pieces fit together
6. **Asking for testing strategies** - Learning what and how to test
7. **Clarifying requirements** - Understanding what the assignment asks for

### What's NOT Allowed ❌

1. **Submitting AI-generated code as your own** - Code you don't understand
2. **Having AI complete entire assignments** - Defeats the learning purpose
3. **Bypassing the learning process** - Using AI to avoid thinking
4. **Sharing AI-generated solutions with classmates** - Still cheating
5. **Using AI during exams/quizzes** - Unless explicitly permitted

### The Test: Can You Explain It? 🤔

**If you can't explain your code line-by-line to the professor, you don't own it.**

Before submitting any code:
1. Can you explain what each part does?
2. Can you explain WHY you made each decision?
3. Could you modify it if requirements changed?
4. Could you debug it if it broke?

If you answered "no" to any of these, **you're not ready to submit**.

---

## 💡 Effective Learning Strategies

### 1. The "Explain Back" Method
After AI explains something:
```
You: "Let me make sure I understand. [Explain in your own words].
     Is that correct?"
```

### 2. The "Build It Myself" Method
After seeing an example:
```
You: "I understand the example. I'm going to try implementing it
     myself and then come back with questions."
```

### 3. The "What If" Method
After understanding a solution:
```
You: "What if we needed to also validate the email format? How
     would I modify this validator?"
```

### 4. The "Break It" Method
After getting code working:
```
You: "I'm going to change [something] to see what breaks. Let me
     test my understanding..."
```

### 5. The "Teach Someone Else" Method
After learning a concept:
- Explain it to a classmate
- Write it in your own notes
- Create a simple example to demonstrate it

---

## 🎯 Example Learning Sessions

### 📗 Example 1: Good Learning Session

```
Student: "I need to add validation for the createMessage endpoint.
         I see we're using express-validator. Can you explain the
         pattern we use?"

AI: [Explains validation middleware pattern in the project]

Student: "So we create an array with validation chains, and then
         check the results? Let me try writing the name validator:

         body('name')
           .trim()
           .notEmpty().withMessage('Name is required')

         Does this look right?"

AI: [Confirms and suggests adding length validation]

Student: "Right, we should limit the length. Looking at the database
         schema, name is VARCHAR(255), so:

         .isLength({ max: 255 }).withMessage('Name too long')

         Now how do I handle the validation results?"

AI: [Explains validationResult and response handling]

Student: "Got it! Let me implement the full validator and test it
         with Postman..."

[Student implements, tests, debugs, learns]
```

**Why this is excellent:**
- ✅ Student asks for understanding, not answers
- ✅ Student tries implementing themselves
- ✅ Student references project patterns
- ✅ Student tests their own work
- ✅ Student builds incrementally

### 📕 Example 2: Bad Learning Session

```
Student: "Write the complete validation middleware for createMessage
         with name, message, and priority validation."

AI: [Generates complete code]

Student: [Copies and pastes]

Student: "Now write the tests for this validation."

AI: [Generates tests]

Student: [Copies and pastes]

Student: [Submits without understanding]
```

**Why this is terrible:**
- ❌ No learning happened
- ❌ Student can't explain the code
- ❌ Student can't modify or debug it
- ❌ Academic integrity violation
- ❌ Student will struggle on exams

---

## 🛠️ How to Ask Good Questions

### Poor Questions ❌
- "Make it work"
- "Fix this"
- "Write the code"
- "What's wrong?"

### Great Questions ✅

**1. Provide Context**
```
"I'm working on the updateMessage controller. I'm trying to update
only the message content while keeping the name and priority the same.
Here's what I've tried: [code]. I'm getting [specific error]. What
concept am I missing?"
```

**2. Show Your Thinking**
```
"I think I need to use a PATCH request here because I'm partially
updating the resource. But I'm not sure how to handle validation for
optional fields. What's the typical pattern for this?"
```

**3. Ask About Concepts, Not Just Code**
```
"When should I use 'body' vs 'query' vs 'params' in express-validator?
I see our project uses all three, but I want to understand when each
is appropriate."
```

**4. Request Explanation, Not Just Answers**
```
"This code works, but I don't understand WHY. Can you explain what
the pool.query() parameterization ($1, $2) does and why we use it
instead of string concatenation?"
```

---

## 📋 Pre-Code Checklist

Before writing any code, make sure you understand:

- [ ] What is the requirement? (What should this endpoint/feature do?)
- [ ] What HTTP method should this use? (GET, POST, PATCH, DELETE)
- [ ] What data comes in? (body, query, params)
- [ ] What validation is needed?
- [ ] What database operation is required?
- [ ] What should the response look like?
- [ ] What errors could occur?
- [ ] How will I test this?

**Use AI to help you think through this checklist, not to skip it.**

---

## 🧪 Testing Your Understanding

After learning something with AI help:

### Level 1: Can you explain it?
Tell the AI (or a classmate) what you learned in your own words.

### Level 2: Can you implement a variation?
If AI helped you create a `getMessageByName` controller, can you create `getMessageByPriority` yourself?

### Level 3: Can you debug it?
Intentionally break your code and fix it without AI help.

### Level 4: Can you teach it?
Explain the concept to a classmate or write documentation for it.

### Level 5: Can you apply it elsewhere?
Use the same pattern in a different context.

---

## 🚀 Recommended Workflow

### 1️⃣ Before Coding
- [ ] Read the assignment/requirement carefully
- [ ] Review relevant documentation in `/docs`
- [ ] Understand the existing code patterns
- [ ] Plan your approach
- [ ] **Then** use AI to clarify concepts

### 2️⃣ During Coding
- [ ] Write code yourself first
- [ ] Use AI to explain errors or concepts
- [ ] Test frequently
- [ ] Commit working code to git
- [ ] Iterate and improve

### 3️⃣ After Coding
- [ ] Test all edge cases
- [ ] Review your code (use AI for code review if helpful)
- [ ] Ensure you can explain every line
- [ ] Write or update tests
- [ ] Document your code

---

## 📱 Using the AI Bootstrap File

This project includes a file called `ai/ai-context.md` that you can copy and paste into any AI chat session to give it full context about the project.

### How to use it:

1. **Open** `ai/ai-context.md` in your editor
2. **Copy** the entire contents between the `---` markers
3. **Paste** into your AI chat at the start of a new session
4. **Then ask** your learning questions

### When to use it:
- ✅ Starting a new chat session about the project
- ✅ When AI needs context about project structure
- ✅ When asking architecture questions
- ✅ When debugging issues that might involve project patterns

### When NOT to use it:
- ❌ For general programming questions unrelated to this project
- ❌ As a way to get AI to write your code for you
- ❌ Every single question (once per session is enough)

### What it contains:
- Project structure and architecture
- Technology stack and versions
- Coding standards and patterns
- All API endpoints and their behavior
- Type definitions and interfaces
- Validation patterns
- Instructions for how AI should help you (teaching approach)

---

## 🎯 Project-Specific Tips

### Understanding This Project

1. **Start with the docs in `/docs`**
   - Read `api-design-patterns.md` first
   - Reference `typescript-patterns.md` for type questions
   - Check `validation-strategies.md` for validation help

2. **Follow existing patterns**
   - Look at `messageController.ts` for controller patterns
   - Check `messageRoutes.ts` for routing patterns
   - Review `messageValidation.ts` for validation patterns

3. **Use path aliases**
   - Import from `@controllers`, not `../../controllers`
   - Import from `@utilities`, not `../../core/utilities`
   - Import from `@/types`, not `../../types`

4. **Test with Postman**
   - There's a Postman collection in the project
   - Test your endpoints as you build them
   - Don't rely only on manual testing

### Common Gotchas

1. **TypeScript path aliases require server restart**
   - If imports aren't resolving, restart `npm run dev`

2. **Express 5 uses different error handling**
   - Don't copy Express 4 examples blindly
   - Follow the project's patterns

3. **Priority is 1-3, not 0-2**
   - 1 = High priority
   - 2 = Medium priority
   - 3 = Low priority

4. **Always use parameterized queries**
   - NEVER: `query('SELECT * FROM messages WHERE name = "' + name + '"')`
   - ALWAYS: `query('SELECT * FROM messages WHERE name = $1', [name])`

---

## 🆘 When to Ask the Professor Instead of AI

### Ask Professor Bryan when:

1. **Requirements are unclear**
   - "What exactly should this endpoint return?"
   - "Is this implementation acceptable?"

2. **Academic integrity questions**
   - "Is it okay to use AI for this part?"
   - "How much help is too much?"

3. **Grading criteria questions**
   - "What level of testing is expected?"
   - "How important is code style vs functionality?"

4. **Technical issues with the environment**
   - "Docker won't start on my machine"
   - "Database connection keeps failing"

5. **Conceptual confusion after trying multiple sources**
   - "I've read the docs and asked AI, but I still don't get middleware"

6. **Project direction questions**
   - "Should I implement authentication for this feature?"
   - "Is this architecture change a good idea?"

### Don't ask the professor:
- Questions answered in the documentation
- Basic syntax questions (Google or AI can answer)
- Questions you haven't tried to solve yourself first
- How to install Node.js or basic tool usage

---

## 📊 Keeping a Learning Log

Consider keeping a learning journal for this course:

### What to log:
- **Concepts you learned** - Middleware, REST, validation, etc.
- **Problems you solved** - How you debugged that tricky error
- **Patterns you discovered** - Reusable code patterns
- **Questions you have** - Things to ask in class or office hours
- **AI interactions that were helpful** - What questions worked well

### Example entry:
```
Date: 2024-10-01
Topic: Express Middleware
What I learned: Middleware functions have access to request, response,
and next. They can modify the request/response or end the chain.
What I built: Created a logging middleware that timestamps requests
Problems: Forgot to call next() at first - server hung
AI help: Asked AI to explain why server wasn't responding, realized
I broke the middleware chain
Still wondering: How do error-handling middleware differ?
```

### Benefits:
- Reinforces learning through writing
- Creates a reference for later
- Shows your learning process to the professor
- Helps during exam prep

---

## 🌟 Success Stories: Real Student Examples

### Story 1: The Debugger 🔍
> "I was getting a 500 error on my GET endpoint. Instead of asking AI to fix it, I asked 'What are common causes of 500 errors in Express?' AI explained server errors vs client errors. Then I looked at my console logs and found I had a typo in my SQL query. I fixed it myself! Felt great."

**What they did right:**
- Asked about concepts, not code
- Used error messages effectively
- Solved it themselves with AI guidance

### Story 2: The Pattern Learner 📚
> "After AI helped me understand the first controller, I implemented the next three myself using the same pattern. Then I asked AI to review my code. It suggested some improvements, and I understood why each one was better."

**What they did right:**
- Learned the pattern, then applied it independently
- Used AI for code review, not code generation
- Understood the improvements

### Story 3: The Tester 🧪
> "I asked AI 'What edge cases should I test for name validation?' It gave me a list: empty strings, very long strings, special characters, SQL injection attempts. I wrote all the tests myself and found bugs I would have missed!"

**What they did right:**
- Used AI for testing strategy
- Wrote tests themselves
- Improved code quality

---

## ⚡ Quick Reference

### Good AI Prompts
- "Explain [concept] in the context of our project"
- "What does this error mean: [error message]"
- "Review this code I wrote: [code]"
- "What edge cases should I consider for [feature]"
- "How does [pattern] work in our codebase"
- "I'm stuck on [problem]. What concepts should I review?"

### Bad AI Prompts
- "Write this endpoint for me"
- "Fix this" (with no context or understanding)
- "Do my assignment"
- "Generate tests for this code I don't understand"

### The Golden Questions
After any AI explanation, ask yourself:
1. **Can I explain this to someone else?**
2. **Can I implement this without looking?**
3. **Do I understand why, not just what?**
4. **Can I modify this if requirements change?**

---

## 🎓 Final Thoughts

AI is an incredibly powerful learning tool, but like any tool, it's how you use it that matters.

### Remember:

🎯 **The goal is YOUR learning, not completed assignments**

🧠 **Struggle is part of learning - don't skip it**

💡 **Understanding > Working code**

🤝 **AI is a tutor, not a solution generator**

✅ **You can explain it = You learned it**

❌ **You can't explain it = Keep learning**

### You're Here to Learn
You're paying for an education, not a degree. Make it count. Use AI to learn **better** and **faster**, but never use it to learn **less**.

When you graduate and join a company, they'll expect you to:
- Understand the code you write
- Debug problems independently
- Learn new technologies quickly
- Explain your decisions clearly
- Collaborate effectively

All of these skills come from **genuine learning**, not from copy-pasting AI-generated code.

---

## 📞 Need More Help?

- **Project Documentation**: Check `/docs` for comprehensive guides
- **AI Bootstrap**: Use `ai/ai-context.md` to give AI project context
- **Professor Bryan**: Office hours or email for course-specific questions
- **Classmates**: Study groups and discussion (but don't share code)
- **Official Docs**: Node.js, Express, TypeScript, PostgreSQL documentation

---

**Good luck, and happy learning! 🚀**

Remember: The best developers are those who can learn, adapt, and understand their code deeply. Use AI as a tool to become that developer.
