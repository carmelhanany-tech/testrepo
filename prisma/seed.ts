import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  const week1 = await prisma.week.upsert({
    where: { number: 1 },
    update: {},
    create: { number: 1, title: "Foundation & Culture" },
  })
  const week2 = await prisma.week.upsert({
    where: { number: 2 },
    update: {},
    create: { number: 2, title: "Tools & Processes" },
  })
  const week3 = await prisma.week.upsert({
    where: { number: 3 },
    update: {},
    create: { number: 3, title: "Customers & Team" },
  })
  const week4 = await prisma.week.upsert({
    where: { number: 4 },
    update: {},
    create: { number: 4, title: "Your Role & Future" },
  })

  // Session 1
  const s1 = await prisma.session.upsert({
    where: { id: "session-1" },
    update: {},
    create: {
      id: "session-1",
      weekId: week1.id,
      order: 1,
      title: "Mission, Vision & Values",
      description:
        "Understand what Empathy stands for, our north star, and the values that guide every decision we make.",
      contentType: "TEXT",
      textContent: `# Mission, Vision & Values

## Our Mission
At Empathy, we believe that **every person deserves support during life's hardest moments**. Our mission is to provide families with the guidance, tools, and compassionate support they need when navigating loss.

## Our Vision
A world where no one faces grief and the administrative burden of loss alone. We envision a future where technology and human connection work together to lighten the load during the most difficult times.

## Our Core Values

### 1. Empathy First
We lead with compassion in everything we do — with our users, with each other, and with the families we serve. Before we act, we ask: *how does this feel from their perspective?*

### 2. Radical Transparency
We share information openly. No hidden agendas. We believe that trust is built through honesty, even when it's uncomfortable.

### 3. Own It
Every person at Empathy takes full ownership of their work. We don't wait to be told what to do — we see a problem and we solve it.

### 4. Quality Over Speed
We would rather do something right than do it fast. The families who rely on us deserve our very best.

### 5. Together We're Stronger
We celebrate collaboration over individual heroics. The best solutions come from diverse perspectives working as one.

---

## Why This Matters for You

As a new team member, these values aren't just words on a wall — they're the lens through which you'll make decisions every day. When you're unsure what to do, come back to these values. They'll guide you.`,
    },
  })

  await prisma.term.deleteMany({ where: { sessionId: s1.id } })
  await prisma.term.createMany({
    data: [
      {
        sessionId: s1.id,
        word: "Mission",
        definition:
          "The core purpose of what Empathy does — providing families with support during loss.",
      },
      {
        sessionId: s1.id,
        word: "Values",
        definition:
          "The guiding principles that shape how we work and make decisions at Empathy.",
      },
      {
        sessionId: s1.id,
        word: "Radical Transparency",
        definition:
          "Empathy's commitment to open, honest communication — sharing information freely and without hidden agendas.",
      },
    ],
  })

  await prisma.question.deleteMany({ where: { sessionId: s1.id } })
  await prisma.question.createMany({
    data: [
      {
        sessionId: s1.id,
        order: 1,
        text: "What is Empathy's core mission?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          "Building the best productivity software",
          "Supporting families through grief and loss",
          "Creating financial tools for businesses",
          "Developing AI for healthcare",
        ]),
        answer: "Supporting families through grief and loss",
      },
      {
        sessionId: s1.id,
        order: 2,
        text: "Which value describes Empathy's commitment to honest, open communication?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          "Quality Over Speed",
          "Own It",
          "Radical Transparency",
          "Empathy First",
        ]),
        answer: "Radical Transparency",
      },
      {
        sessionId: s1.id,
        order: 3,
        text: "At Empathy, 'Own It' means waiting for someone to assign you a task before starting.",
        type: "TRUE_FALSE",
        options: JSON.stringify(["True", "False"]),
        answer: "False",
      },
    ],
  })

  // Session 2
  const s2 = await prisma.session.upsert({
    where: { id: "session-2" },
    update: {},
    create: {
      id: "session-2",
      weekId: week1.id,
      order: 2,
      title: "Intro to Our Product",
      description:
        "Get a clear picture of what we build, who uses it, and how we're changing the experience of loss.",
      contentType: "TEXT",
      textContent: `# Introduction to Our Product

## What We Build

Empathy is an **end-of-life support platform** that helps families navigate the practical, emotional, and administrative challenges that follow the loss of a loved one.

### The Core Product
Our platform provides:
- **Personalized action plans** — step-by-step guidance through estate settling, benefit claims, and more
- **Document management** — a secure place to organize and store important documents
- **Expert support** — access to our team of Care Managers who guide families through complex processes
- **Emotional wellbeing tools** — resources to support the grieving process alongside the administrative tasks

## Who Uses Empathy?

### Primary Users: Bereaved Families
People who have recently lost a loved one and are overwhelmed by the hundreds of administrative tasks that follow.

### Distribution Partners
Empathy is often offered as a **benefit through employers and insurance companies**, who provide it to their employees and policyholders as part of their care offering.

## The Problem We Solve

When someone loses a loved one, they face on average **570 hours of administrative work** across 3-5 years. This includes:
- Notifying government agencies
- Canceling subscriptions and accounts
- Settling the estate
- Filing for survivor benefits
- Managing finances

Empathy reduces this burden dramatically, letting families focus on what matters: **grief, healing, and connection**.

---

## Key Metrics We Care About
- **Time saved** for families
- **Tasks completed** through our platform
- **NPS (Net Promoter Score)** — how likely families are to recommend us
- **Care satisfaction** — quality of our human support`,
    },
  })

  await prisma.term.deleteMany({ where: { sessionId: s2.id } })
  await prisma.term.createMany({
    data: [
      {
        sessionId: s2.id,
        word: "Care Manager",
        definition:
          "A trained Empathy team member who provides personalized guidance to bereaved families navigating complex processes.",
      },
      {
        sessionId: s2.id,
        word: "Action Plan",
        definition:
          "A personalized, step-by-step checklist generated for each family based on their specific situation and needs.",
      },
      {
        sessionId: s2.id,
        word: "NPS",
        definition:
          "Net Promoter Score — a measure of how likely our users are to recommend Empathy to others, on a scale of -100 to 100.",
      },
      {
        sessionId: s2.id,
        word: "Distribution Partner",
        definition:
          "An employer or insurance company that offers Empathy as a benefit to their employees or policyholders.",
      },
    ],
  })

  await prisma.question.deleteMany({ where: { sessionId: s2.id } })
  await prisma.question.createMany({
    data: [
      {
        sessionId: s2.id,
        order: 1,
        text: "On average, how many hours of administrative work do bereaved families face?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify(["100 hours", "250 hours", "570 hours", "1000 hours"]),
        answer: "570 hours",
      },
      {
        sessionId: s2.id,
        order: 2,
        text: "What is a 'Distribution Partner' in Empathy's business model?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          "A logistics company",
          "An employer or insurer who offers Empathy as a benefit",
          "A grief counselor",
          "A government agency",
        ]),
        answer: "An employer or insurer who offers Empathy as a benefit",
      },
      {
        sessionId: s2.id,
        order: 3,
        text: "NPS stands for Net Promoter Score.",
        type: "TRUE_FALSE",
        options: JSON.stringify(["True", "False"]),
        answer: "True",
      },
      {
        sessionId: s2.id,
        order: 4,
        text: "Which of the following is NOT a core feature of the Empathy platform?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          "Personalized action plans",
          "Document management",
          "Tax filing software",
          "Expert Care Manager support",
        ]),
        answer: "Tax filing software",
      },
    ],
  })

  // Session 3
  const s3 = await prisma.session.upsert({
    where: { id: "session-3" },
    update: {},
    create: {
      id: "session-3",
      weekId: week2.id,
      order: 1,
      title: "How We Work — Tools & Processes",
      description:
        "Learn the tools, rituals, and processes that keep Empathy running smoothly.",
      contentType: "TEXT",
      textContent: `# How We Work at Empathy

## Our Operating Rhythm

Empathy runs on a mix of **synchronous and asynchronous work**. We respect deep work time and minimize unnecessary meetings.

### Weekly Rituals
- **Monday All-Hands** (30 min) — Company-wide sync on priorities and announcements
- **Team Standups** (15 min daily) — Quick async updates via Slack
- **Friday Wins** — Share your week's wins in #wins on Slack

## Core Tools

### Communication
- **Slack** — Primary async communication. Default to public channels over DMs
- **Zoom** — Video calls for meetings that need face time
- **Notion** — Our knowledge base, project docs, and meeting notes

### Project Management
- **Linear** — Engineering task tracking
- **Notion** — Product specs, roadmaps, and documentation
- **Figma** — Design work and prototypes

### People & HR
- **HiBob (Bob)** — HR platform for time off, onboarding, and people data
- **Lattice** — Performance reviews and 1:1s

## Communication Norms

### Response Times
- Slack DM: within 4 hours during work hours
- Email: within 24 hours
- Urgent (marked 🚨): as soon as possible

### Meeting Culture
- Every meeting has an agenda
- Default meetings are 25 or 50 minutes (not 30 or 60)
- Start and end on time
- Notes are taken and shared in Notion after

## How Decisions Are Made

We use a **DACI framework**:
- **D**river — who owns getting the decision made
- **A**pprover — who has final say
- **C**ontributors — who has input
- **I**nformed — who needs to know the outcome`,
    },
  })

  await prisma.term.deleteMany({ where: { sessionId: s3.id } })
  await prisma.term.createMany({
    data: [
      {
        sessionId: s3.id,
        word: "DACI",
        definition:
          "A decision-making framework: Driver (owns the process), Approver (final say), Contributors (input), Informed (notified of outcome).",
      },
      {
        sessionId: s3.id,
        word: "Async",
        definition:
          "Asynchronous communication — messages or updates that don't require an immediate response.",
      },
      {
        sessionId: s3.id,
        word: "Linear",
        definition:
          "The project management tool used by Empathy's engineering team to track tasks, bugs, and features.",
      },
      {
        sessionId: s3.id,
        word: "HiBob",
        definition:
          "Empathy's HR platform (also called 'Bob') used for time off requests, onboarding, and people data.",
      },
    ],
  })

  await prisma.question.deleteMany({ where: { sessionId: s3.id } })
  await prisma.question.createMany({
    data: [
      {
        sessionId: s3.id,
        order: 1,
        text: "In the DACI framework, who has the final say on a decision?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify(["Driver", "Approver", "Contributor", "Informed"]),
        answer: "Approver",
      },
      {
        sessionId: s3.id,
        order: 2,
        text: "What is the primary tool for async communication at Empathy?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify(["Email", "Zoom", "Slack", "Notion"]),
        answer: "Slack",
      },
      {
        sessionId: s3.id,
        order: 3,
        text: "Default meetings at Empathy are scheduled for exactly 30 or 60 minutes.",
        type: "TRUE_FALSE",
        options: JSON.stringify(["True", "False"]),
        answer: "False",
      },
    ],
  })

  // Session 4
  const s4 = await prisma.session.upsert({
    where: { id: "session-4" },
    update: {},
    create: {
      id: "session-4",
      weekId: week3.id,
      order: 1,
      title: "Customer Empathy & Our Users",
      description:
        "Deep-dive into who our users are, what they experience, and how we build with them in mind.",
      contentType: "TEXT",
      textContent: `# Customer Empathy & Our Users

## Understanding Our Users

Before we build anything, we ask: *who is this for, and what are they going through?*

Our primary users are people who have just lost someone they love. They're not in a normal headspace. They're grieving, exhausted, and overwhelmed. Every design decision, every word we write, every interaction we create must be filtered through this lens.

## User Personas

### The Overwhelmed Administrator
**Maria, 52**
Maria just lost her mother. She's the eldest child and has been designated executor of the estate. She's never done this before. She has a full-time job, two kids, and is trying to grieve while simultaneously calling banks, government offices, and insurance companies.

*Her need:* Tell me exactly what to do, step by step. I can't think right now.

### The Long-Distance Family Member
**James, 34**
James lost his father but lives 2,000 miles away. He's trying to coordinate with siblings, manage things remotely, and deal with his own grief while keeping his life running.

*His need:* Help me stay on top of things without being physically present.

### The Surviving Spouse
**Ruth, 71**
Ruth just lost her husband of 47 years. She's never paid a bill alone, never dealt with the government.

*Her need:* Don't overwhelm me. Guide me gently, one tiny step at a time.

## Trauma-Informed Design

Working with bereaved families requires **trauma-informed design**:

1. **Safety** — every interaction feels safe and non-judgmental
2. **Transparency** — we explain what we're doing and why
3. **Collaboration** — we work *with* families, not at them
4. **Empowerment** — we build their confidence, not dependency

## What This Means for You

No matter your role, you will interact with or build for people in their most vulnerable moments. This is an honor and a responsibility. Hold it carefully.`,
    },
  })

  await prisma.term.deleteMany({ where: { sessionId: s4.id } })
  await prisma.term.createMany({
    data: [
      {
        sessionId: s4.id,
        word: "Executor",
        definition:
          "The person legally designated to carry out the instructions in a will and manage the estate of someone who has died.",
      },
      {
        sessionId: s4.id,
        word: "Trauma-Informed Design",
        definition:
          "A design approach that recognizes users may be in emotional distress, prioritizing safety, transparency, and empowerment in every interaction.",
      },
      {
        sessionId: s4.id,
        word: "User Persona",
        definition:
          "A fictional but research-based profile representing a key user type, used to guide product decisions.",
      },
    ],
  })

  await prisma.question.deleteMany({ where: { sessionId: s4.id } })
  await prisma.question.createMany({
    data: [
      {
        sessionId: s4.id,
        order: 1,
        text: "Which of the following is NOT one of the principles of trauma-informed design?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify(["Safety", "Speed", "Collaboration", "Empowerment"]),
        answer: "Speed",
      },
      {
        sessionId: s4.id,
        order: 2,
        text: "An executor is the person legally designated to manage a deceased person's estate.",
        type: "TRUE_FALSE",
        options: JSON.stringify(["True", "False"]),
        answer: "True",
      },
      {
        sessionId: s4.id,
        order: 3,
        text: "What is the main goal of trauma-informed design at Empathy?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          "To design the fastest possible user experience",
          "To create safe, empowering experiences for grieving users",
          "To minimize the number of screens in the app",
          "To comply with legal requirements",
        ]),
        answer: "To create safe, empowering experiences for grieving users",
      },
    ],
  })

  // Session 5
  const s5 = await prisma.session.upsert({
    where: { id: "session-5" },
    update: {},
    create: {
      id: "session-5",
      weekId: week3.id,
      order: 2,
      title: "Team Deep Dive",
      description:
        "Meet your teams, understand the org structure, and learn how different functions work together.",
      contentType: "TEXT",
      textContent: `# Team Deep Dive

## How Empathy Is Organized

Empathy operates with a mix of functional teams and cross-functional squads that come together around products and initiatives.

## Core Functions

### Product & Engineering
Builds and maintains the Empathy platform. Organized into squads:
- **Family Experience Squad** — the core user-facing product
- **Partner Integration Squad** — connecting with employer and insurance partners
- **Platform Squad** — infrastructure, security, and reliability

### Care Operations
Our Care Managers who directly support families. This is the heart of Empathy — the humans behind the technology.

### Growth & Marketing
Responsible for partnerships, brand, and bringing Empathy to more people who need it.

### People & Talent
Ensures Empathy is a great place to work. Owns hiring, onboarding (that's you!), culture, and people ops.

### Finance & Legal
Keeps us financially healthy and legally compliant.

## Cross-Functional Collaboration

Most meaningful work at Empathy happens across functions. A typical initiative might involve:
- Product defining the problem and solution
- Engineering building it
- Care Ops validating it works for families
- Marketing communicating it
- Legal ensuring compliance

## Slack Channels to Join
- **#general** — company-wide announcements
- **#wins** — celebrate successes
- **#learning** — share articles, courses, and insights
- **#random** — the fun stuff`,
    },
  })

  await prisma.term.deleteMany({ where: { sessionId: s5.id } })
  await prisma.term.createMany({
    data: [
      {
        sessionId: s5.id,
        word: "Squad",
        definition:
          "A small, cross-functional team at Empathy organized around a specific product area or initiative.",
      },
      {
        sessionId: s5.id,
        word: "Care Operations",
        definition:
          "The team of trained Care Managers at Empathy who provide direct human support to bereaved families.",
      },
    ],
  })

  await prisma.question.deleteMany({ where: { sessionId: s5.id } })
  await prisma.question.createMany({
    data: [
      {
        sessionId: s5.id,
        order: 1,
        text: "Which squad is responsible for the core user-facing Empathy product?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          "Partner Integration Squad",
          "Platform Squad",
          "Family Experience Squad",
          "Growth Squad",
        ]),
        answer: "Family Experience Squad",
      },
      {
        sessionId: s5.id,
        order: 2,
        text: "Care Operations is made up of trained professionals who directly support families.",
        type: "TRUE_FALSE",
        options: JSON.stringify(["True", "False"]),
        answer: "True",
      },
    ],
  })

  // Session 6
  const s6 = await prisma.session.upsert({
    where: { id: "session-6" },
    update: {},
    create: {
      id: "session-6",
      weekId: week4.id,
      order: 1,
      title: "Your Role & 30-60-90 Plan",
      description: "Set yourself up for success with a clear plan for your first 90 days.",
      contentType: "TEXT",
      textContent: `# Your Role & 30-60-90 Plan

## The 30-60-90 Framework

At Empathy, we use a **30-60-90 day framework** to help new team members ramp up effectively.

### First 30 Days: Learn
Your job is to **absorb, observe, and ask questions**. Don't try to change things or ship things yet.
- Complete your onboarding sessions (that's this platform!)
- Meet everyone on your team and in adjacent teams
- Read existing documentation, specs, and strategies

*Success metric:* Can you explain what your team does and why?

### Days 31-60: Contribute
Start adding real value in **defined, scoped ways**.
- Take on your first real task or project
- Give your manager a weekly update on progress and blockers
- Start forming opinions — write them down

*Success metric:* Have you shipped something or made a meaningful contribution?

### Days 61-90: Own
Begin **leading a piece of work** independently.
- Drive a project from start to finish
- Share your perspectives in team discussions
- Give feedback to teammates

*Success metric:* Are you driving, not just contributing?

## Working With Your Manager

Your manager is your partner in your first 90 days. Use your 1:1s well:
- Share what you're working on and where you're stuck
- Ask for feedback early and often
- Be honest about what's unclear

## Setting Your Own Goals

By the end of month 1, work with your manager to define **3 clear goals** for your first 6 months.`,
    },
  })

  await prisma.term.deleteMany({ where: { sessionId: s6.id } })
  await prisma.term.createMany({
    data: [
      {
        sessionId: s6.id,
        word: "30-60-90 Plan",
        definition:
          "A structured onboarding framework dividing the first 90 days into three phases: Learn (1-30), Contribute (31-60), and Own (61-90).",
      },
      {
        sessionId: s6.id,
        word: "1:1",
        definition:
          "A regular one-on-one meeting between a manager and a direct report, used for updates, feedback, and coaching.",
      },
    ],
  })

  await prisma.question.deleteMany({ where: { sessionId: s6.id } })
  await prisma.question.createMany({
    data: [
      {
        sessionId: s6.id,
        order: 1,
        text: "What is the main focus during the first 30 days at Empathy?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          "Ship a major feature",
          "Learn and absorb",
          "Lead a project independently",
          "Hire new teammates",
        ]),
        answer: "Learn and absorb",
      },
      {
        sessionId: s6.id,
        order: 2,
        text: "During days 61-90, you should be driving a piece of work independently.",
        type: "TRUE_FALSE",
        options: JSON.stringify(["True", "False"]),
        answer: "True",
      },
      {
        sessionId: s6.id,
        order: 3,
        text: "How many clear goals should you set with your manager by the end of month 1?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify(["1", "3", "5", "10"]),
        answer: "3",
      },
    ],
  })

  // Session 7
  const s7 = await prisma.session.upsert({
    where: { id: "session-7" },
    update: {},
    create: {
      id: "session-7",
      weekId: week4.id,
      order: 2,
      title: "Final Integration",
      description:
        "Bring it all together — reflect on your onboarding journey and commit to your path forward at Empathy.",
      contentType: "TEXT",
      textContent: `# Final Integration

## You Made It!

Completing this onboarding program means you now have a foundation in everything that makes Empathy, Empathy. Take a moment to appreciate that — you've covered a lot of ground.

## What You've Learned

Over the past four weeks, you've explored:

- **Who we are** — Our mission to support families through loss, our vision, and our values
- **What we build** — The Empathy platform, our users, and the problem we're solving
- **How we work** — Our tools, rituals, communication norms, and decision-making frameworks
- **Who we serve** — Our users' real lives, trauma-informed design
- **Our team** — How Empathy is organized and how functions collaborate
- **Your path** — The 30-60-90 framework and how to set yourself up for success

## The Empathy Mindset

Carry these three things with you every day:

### 1. Lead with Empathy
Every decision you make affects real families in real pain. Keep that human at the center of your work.

### 2. Own Your Impact
You were hired because you bring something unique. Don't wait for permission — bring your best thinking forward.

### 3. Keep Learning
Empathy is a fast-moving company in a complex space. Stay curious. Ask questions. Share what you learn.

---

## What's Next

This platform will continue to be your learning home. Your manager will add resources specific to your role. You can always come back to review sessions, look up terms in the glossary, or revisit your progress.

**Welcome to the Empathy family. We're so glad you're here.**`,
    },
  })

  await prisma.term.deleteMany({ where: { sessionId: s7.id } })
  await prisma.term.createMany({
    data: [
      {
        sessionId: s7.id,
        word: "Onboarding",
        definition:
          "The process of integrating a new employee into Empathy — learning our culture, tools, product, and team.",
      },
    ],
  })

  await prisma.question.deleteMany({ where: { sessionId: s7.id } })
  await prisma.question.createMany({
    data: [
      {
        sessionId: s7.id,
        order: 1,
        text: "Which of the following best captures the 'Empathy Mindset'?",
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify([
          "Move fast, break things",
          "Lead with empathy, own your impact, keep learning",
          "Compete and win at all costs",
          "Follow instructions carefully at all times",
        ]),
        answer: "Lead with empathy, own your impact, keep learning",
      },
      {
        sessionId: s7.id,
        order: 2,
        text: "After completing onboarding, the platform is no longer useful to you.",
        type: "TRUE_FALSE",
        options: JSON.stringify(["True", "False"]),
        answer: "False",
      },
    ],
  })

  // Users
  const hashedPassword = await bcrypt.hash("empathy123", 10)

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@empathy.com" },
    update: {},
    create: {
      email: "manager@empathy.com",
      password: hashedPassword,
      name: "Sarah Chen",
      role: "MANAGER",
    },
  })

  await prisma.user.upsert({
    where: { email: "employee@empathy.com" },
    update: {},
    create: {
      email: "employee@empathy.com",
      password: hashedPassword,
      name: "Alex Johnson",
      role: "EMPLOYEE",
      managerId: managerUser.id,
    },
  })

  await prisma.user.upsert({
    where: { email: "hr@empathy.com" },
    update: {},
    create: {
      email: "hr@empathy.com",
      password: hashedPassword,
      name: "Jordan Lee",
      role: "HR",
    },
  })

  await prisma.user.upsert({
    where: { email: "admin@empathy.com" },
    update: {},
    create: {
      email: "admin@empathy.com",
      password: hashedPassword,
      name: "Carmel Hanany",
      role: "ADMIN",
    },
  })

  console.log("✅ Seed complete! 4 weeks · 7 sessions · 4 users")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
