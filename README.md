# SENSAI

**AI-powered career toolkit built with Next.js**

SENSAI is a web application that helps users prepare professional career
materials with AI assistance. The project includes a resume builder,
AI-assisted resume content improvement, and a cover-letter workflow that
generates, saves, lists, previews, and deletes cover letters.

> **Documentation note:** This README is based on the project files and
> behavior shared during development. The directory tree and
> architecture descriptions reflect the paths and integrations observed
> so far; confirm any additional modules or database models against the
> current repository before treating this as an exhaustive inventory.

------------------------------------------------------------------------

## Table of Contents

-   [Project Overview](#project-overview)
-   [Core Features](#core-features)
-   [Technology Stack](#technology-stack)
-   [Architecture at a Glance](#architecture-at-a-glance)
-   [Request and Data Flows](#request-and-data-flows)
-   [Project Structure](#project-structure)
-   [Key Modules](#key-modules)
-   [Data and Persistence](#data-and-persistence)
-   [Authentication and
    Authorization](#authentication-and-authorization)
-   [AI Integration](#ai-integration)
-   [Rendering and Navigation](#rendering-and-navigation)
-   [Environment Configuration](#environment-configuration)
-   [Local Development](#local-development)
-   [Operational Notes](#operational-notes)
-   [Security Considerations](#security-considerations)
-   [Future Documentation
    Improvements](#future-documentation-improvements)

------------------------------------------------------------------------

## Project Overview

SENSAI is designed to support career-document preparation through a web
interface and AI-powered content generation. Its server-side actions
handle authenticated user lookups, database reads and writes, and
requests to the Gemini generative AI model.

The application currently includes two documented workflows:

1.  **Resume Builder** --- enter and edit contact information, a
    professional summary, skills, work experience, education, and
    projects; improve supported text fields with AI; preview the resume
    in Markdown; save it; and export the preview as a PDF.
2.  **AI Cover Letters** --- provide job and company details plus a job
    description; generate a tailored cover letter with Gemini; save it
    to the database; browse saved cover letters; open a specific letter;
    and delete a letter with confirmation.

The code uses Next.js App Router conventions, React components, Clerk
authentication, Prisma database access, and server actions to connect
the interface to backend operations.

## Core Features

### Resume Builder

-   Form-based resume editing.
-   Contact information fields, including email, mobile number,
    LinkedIn, and Twitter/X.
-   Professional summary and skills sections.
-   Repeated entry forms for work experience, education, and projects.
-   AI-assisted improvement of resume text through the `improveWithAI`
    server action.
-   Markdown preview using `@uiw/react-md-editor`.
-   Save operation backed by Prisma.
-   PDF export using `html2pdf.js`, `html2canvas`, and `jsPDF`.

### AI Cover Letters

-   Generate a cover letter for a specified job title and company.
-   Use the job description and available candidate profile information
    as context for generation.
-   Format generated content as Markdown.
-   Persist generated cover letters in the database.
-   List the signed-in user's saved cover letters, newest first.
-   Open a cover letter by its identifier.
-   Delete a cover letter after a confirmation step.
-   Display success or failure feedback in the UI.

### User-Specific Data Access

-   Clerk provides the authenticated user ID.
-   Server actions look up the corresponding application user record.
-   Resume and cover-letter queries are scoped to the current user's
    application database ID.

------------------------------------------------------------------------

## Technology Stack

  ---------------------------------------------------------------------
  Area                               Technology observed in the project
  ---------------------------------- ----------------------------------
  Web framework                      Next.js App Router

  UI framework                       React

  Authentication                     Clerk (`@clerk/nextjs`)

  Database access                    Prisma Client

  Database                           PostgreSQL hosted on Neon, based
                                     on the configured connection host
                                     shared during troubleshooting

  Generative AI                      Google Generative AI SDK
                                     (`@google/generative-ai`)

  AI model configured in the shared  `gemini-3.8-flash`
  code                               

  Form handling                      React Hook Form

  Form validation                    Zod with `@hookform/resolvers`

  Markdown editor/renderer           `@uiw/react-md-editor`

  PDF generation                     `html2pdf.js`, with `html2canvas`
                                     and `jsPDF` dependencies

  Icons                              `lucide-react`

  Date formatting                    `date-fns`

  Notifications                      `sonner`

  UI components                      Project components under
                                     `components/ui/`
  ---------------------------------------------------------------------

Check `package.json` for the exact versions installed in your current
checkout.

------------------------------------------------------------------------

## Architecture at a Glance

SENSAI follows a component-based frontend with server-side actions for
protected operations.

``` text
Browser
  |
  v
Next.js App Router pages
  |
  +--> React UI components
  |      |
  |      +--> Forms, preview, buttons, dialogs, notifications
  |
  +--> Server Actions
         |
         +--> Clerk authentication
         |
         +--> Prisma Client
         |      |
         |      v
         |    PostgreSQL / Neon
         |
         +--> Google Generative AI API
```

### Architectural responsibilities

**App Router pages** - Define route-level page composition. - Load
route-specific data where required. - Render the appropriate UI and
child components. - Use React `Suspense` boundaries where asynchronous
content should be streamed independently.

**Client components** - Manage interactive state, form input, button
actions, dialogs, and navigation. - Call server actions for protected
data operations. - Present loading, success, and error states.

**Server actions** - Execute server-side operations such as
authenticated database reads and writes. - Verify the current Clerk
session. - Translate the Clerk user ID into the application user's
database record. - Invoke Gemini when AI-generated content is
requested. - Return the result to the calling UI.

**Prisma** - Provides typed database access from server-side code. -
Reads and writes resume and cover-letter records. - Applies query
filters that scope records to the authenticated application user.

**External services** - Clerk handles authentication. - Google Gemini
generates AI-assisted text. - Neon hosts the PostgreSQL database in the
environment previously shared.

------------------------------------------------------------------------

## System Design Diagrams

The diagrams below document the architecture visible in the shared
project code. They distinguish browser interactions, Next.js routes,
server actions, authentication, AI-provider calls, and database
persistence. The database diagram is a **logical view** of relationships
implied by the code, not a replacement for the actual Prisma schema.

### 1. High-Level System Architecture

``` mermaid
flowchart TB
    User["User / Browser"]
    Pages["Next.js App Router<br/>Resume and Cover Letter pages"]
    UI["React Client Components<br/>Forms · Preview · Dialogs · Toasts"]
    Actions["Next.js Server Actions<br/>resume.js · cover-letter.js"]
    Auth["Clerk Authentication<br/>auth() → userId"]
    AppUser["Prisma: find application user<br/>where clerkUserId = userId"]
    DB[("PostgreSQL on Neon<br/>via Prisma Client")]
    Gemini["Google Generative AI API<br/>configured Gemini model"]
    PDF["Client-side PDF export<br/>html2pdf.js → html2canvas / jsPDF"]

    User --> Pages
    Pages --> UI
    UI -->|"Server Action call"| Actions
    Pages -->|"Server-side data load"| Actions
    Actions --> Auth
    Auth -->|"Authenticated userId"| AppUser
    AppUser <--> DB
    Actions -->|"AI prompt / generation request"| Gemini
    Gemini -->|"Generated text"| Actions
    Actions -->|"Persist / read result"| DB
    Actions -->|"Result or error"| UI
    UI --> PDF
    PDF -->|"resume.pdf download"| User
```

**How to read it**

-   The browser displays the Next.js pages and interactive React
    components.
-   Server actions run on the server; they authenticate with Clerk and
    access data through Prisma.
-   PostgreSQL is hosted on Neon in the configuration previously shared.
-   Gemini is called by server-side actions for AI text generation and
    improvement.
-   Resume PDF export is performed in the client from a rendered
    Markdown element.

### 2. Authenticated Server-Action and Database Request

``` mermaid
sequenceDiagram
    actor User
    participant UI as Next.js Page / React UI
    participant SA as Server Action
    participant Clerk as Clerk auth()
    participant Prisma as Prisma Client
    participant DB as Neon PostgreSQL

    User->>UI: Open page / submit action
    UI->>SA: Invoke server action
    SA->>Clerk: Read current session
    Clerk-->>SA: userId or unauthenticated
    alt No authenticated user
        SA-->>UI: Throw Unauthorized
    else Authenticated
        SA->>Prisma: Find User by clerkUserId
        Prisma->>DB: Execute SQL query
        DB-->>Prisma: User record
        Prisma-->>SA: Application user
        SA->>Prisma: Read / write data scoped to user.id
        Prisma->>DB: Execute SQL query
        DB-->>Prisma: Data / write result
        Prisma-->>SA: Query result
        SA-->>UI: Return data or operation result
    end
```

This sequence reflects the pattern in the shared actions: call `auth()`,
reject missing sessions, look up the application user by `clerkUserId`,
and then perform user-scoped database operations.

### 3. AI Cover-Letter Generation Flow

``` mermaid
sequenceDiagram
    actor User
    participant Form as Cover Letter Form
    participant Action as generateCoverLetter(data)
    participant Clerk as Clerk
    participant Prisma as Prisma Client
    participant DB as Neon PostgreSQL
    participant Gemini as Google Generative AI

    User->>Form: Enter job title, company, job description
    Form->>Action: Submit cover-letter data
    Action->>Clerk: auth()
    Clerk-->>Action: userId
    Action->>Prisma: Find application user
    Prisma->>DB: Query user by clerkUserId
    DB-->>Prisma: Profile context
    Prisma-->>Action: User fields
    Action->>Gemini: Prompt with job details + candidate context
    Gemini-->>Action: Generated Markdown letter
    Action->>Prisma: Create coverLetter record
    Prisma->>DB: Insert content, job details, status, userId
    DB-->>Prisma: Saved record
    Prisma-->>Action: Cover-letter record
    Action-->>Form: Return generated/saved letter
    Form-->>User: Display result / allow subsequent viewing
```

### 4. Resume Read, Edit, Save, AI Improvement, and PDF Export

``` mermaid
flowchart TD
    Start["Open Resume page"] --> Load["getResume() server action"]
    Load --> Check["Clerk auth()"]
    Check --> UserLookup["Prisma: find User by clerkUserId"]
    UserLookup --> ResumeQuery["Prisma: find resume by user.id"]
    ResumeQuery --> Form["Resume Builder form"]
    Form --> Edit["Edit contact, summary, skills,<br/>experience, education, projects"]
    Edit --> Preview["Compose and render Markdown preview"]
    Preview --> SaveChoice{"User action"}
    SaveChoice -->|"Save"| SaveAction["saveResume(content)"]
    SaveAction --> Upsert["Prisma upsert by userId"]
    Upsert --> DB[("Neon PostgreSQL")]
    SaveChoice -->|"Improve text"| Improve["improveWithAI({ current, type })"]
    Improve --> Gemini["Google Generative AI"]
    Gemini --> Improved["Return improved text to form"]
    Improved --> Edit
    SaveChoice -->|"Download PDF"| PDF["html2pdf.js captures resume-pdf element"]
    PDF --> Canvas["html2canvas + jsPDF"]
    Canvas --> Download["Download resume.pdf"]
```

The PDF branch is client-side. The database and Gemini branches are
server-side actions. The diagram shows the flow documented in the shared
`resume-builder.jsx` and `actions/resume.js` code.

### 5. Cover-Letter Listing, Viewing, and Deletion

``` mermaid
flowchart TD
    Listing["/ai-cover-letter"] --> ListAction["getCoverLetters()"]
    ListAction --> Auth["Clerk authentication"]
    Auth --> User["Find application user"]
    User --> Query["Find cover letters where userId = user.id<br/>order by createdAt descending"]
    Query --> Cards["CoverLetterList cards"]
    Cards --> View["View selected letter"]
    View --> DetailRoute["/ai-cover-letter/[id]"]
    DetailRoute --> GetOne["getCoverLetter(id)"]
    GetOne --> Ownership["Query by id AND userId"]
    Ownership --> Preview["CoverLetterPreview"]
    Cards --> DeleteClick["Click Delete"]
    DeleteClick --> Confirm{"Confirm deletion?"}
    Confirm -->|"Cancel"| Cards
    Confirm -->|"Delete"| DeleteAction["deleteCoverLetter(id)"]
    DeleteAction --> OwnershipCheck["Verify auth and user ownership"]
    OwnershipCheck --> DeleteDB[("Delete matching record in Neon")]
    DeleteDB --> Refresh["Toast + router.refresh()"]
    Refresh --> Listing
```

### 6. Logical Data Model

``` mermaid
erDiagram
    USER ||--o| RESUME : owns
    USER ||--o{ COVER_LETTER : owns

    USER {
        string id
        string clerkUserId
        string industry
        string experience
        string skills
        string bio
    }
    RESUME {
        string id
        string userId
        string content
    }
    COVER_LETTER {
        string id
        string userId
        string jobTitle
        string companyName
        string jobDescription
        string content
        string status
        datetime createdAt
    }
```

**Data-model caveat:** This diagram is a conceptual summary inferred
from the fields and Prisma operations in the shared code. Exact field
types, optionality, primary keys, foreign keys, indexes, and
relationship cardinality must be confirmed against
`prisma/schema.prisma`. The resume action's upsert is keyed by `userId`;
the cover-letter actions filter records by the current user's database
ID.

### 7. Environment and External-Service Connections

``` mermaid
flowchart LR
    Env["Local environment / deployment secrets"]
    DBURL["DATABASE_URL"]
    GeminiKey["GEMINI_API_KEY"]
    ClerkKeys["Clerk environment keys"]
    Prisma["Prisma Client"]
    Neon[("Neon PostgreSQL")]
    Gemini["Google Generative AI API"]
    Clerk["Clerk Authentication"]

    Env --> DBURL --> Prisma --> Neon
    Env --> GeminiKey --> Gemini
    Env --> ClerkKeys --> Clerk
```

Keep secrets in environment configuration. Never put database URLs,
Clerk secret keys, or Gemini API keys into client components, committed
documentation, or public repositories. The exact Clerk variable names
and any additional database URLs should be verified against the current
`.env` setup and deployment configuration.

### 8. API and Integration Boundaries

  ---------------------------------------------------------------------------------
  Integration       Direction         Purpose           Location observed
  ----------------- ----------------- ----------------- ---------------------------
  Browser → Next.js Request           Load pages and    `app/(main)/...`
  route                               interactive UI    

  UI → server       Request /         Save, fetch,      `actions/resume.js`,
  action            response          delete, or        `actions/cover-letter.js`
                                      improve content   

  Server action →   Server-side auth  Resolve the       `auth()` from
  Clerk             lookup            current           `@clerk/nextjs/server`
                                      authenticated     
                                      user              

  Server action →   Database queries  Read/write        `lib/prisma.js` and action
  Prisma → Neon                       application       files
                                      users, resumes,   
                                      cover letters     

  Server action →   AI request /      Generate cover    Google Generative AI SDK
  Gemini            response          letters and       
                                      improve resume    
                                      text              

  Browser → PDF     Client-side       Convert the       `resume-builder.jsx`
  libraries         processing        resume preview to 
                                      a downloadable    
                                      PDF               
  ---------------------------------------------------------------------------------

The shared code shows server actions rather than a separately defined
REST API for these workflows. Do not document these actions as public
REST endpoints unless the repository also contains route handlers under
`app/api/` or another API server.

## Request and Data Flows

### 1. Resume loading and editing

1.  The resume route calls `getResume()`.
2.  The server action checks the Clerk session.
3.  The action looks up the application user using `clerkUserId`.
4.  The user's resume record is fetched through Prisma.
5.  The page passes the saved content to the resume builder.
6.  The client-side form lets the user edit resume fields and preview
    the composed Markdown.

### 2. Resume saving

1.  The user submits the resume form.
2.  The client calls `saveResume()` through the project's fetch hook.
3.  The server action checks authentication and finds the application
    user.
4.  Prisma uses an upsert keyed by the user's application ID to create
    or update the resume.
5.  The action revalidates the resume route.
6.  The UI displays success or error feedback.

### 3. AI-assisted resume content

1.  The user enters a description or supported text field.
2.  The UI calls the `improveWithAI()` server action with the current
    text and content type.
3.  The action checks authentication and loads the user context used by
    its prompt.
4.  The Gemini model generates an improved version of the text.
5.  The UI receives the response and updates the relevant field.

AI output should be reviewed before saving. Generated text should not be
assumed to be factually correct without user verification.

### 4. Cover-letter generation

1.  The user provides a job title, company name, and job description.
2.  The UI calls `generateCoverLetter(data)`.
3.  The server action verifies the Clerk session and loads the
    application user.
4.  The action builds a prompt using the job details and available
    candidate profile fields.
5.  Gemini generates the Markdown cover letter.
6.  Prisma creates a cover-letter record associated with the
    authenticated user.
7.  The result is returned to the UI for display or subsequent
    navigation.

### 5. Cover-letter listing, viewing, and deletion

**Listing** 1. `getCoverLetters()` verifies authentication. 2. Prisma
fetches only cover letters associated with the current application user.
3. Results are sorted by `createdAt` in descending order. 4.
`CoverLetterList` displays the saved items.

**Viewing** 1. The edit route receives the route parameter `id`. 2.
`getCoverLetter(id)` verifies authentication. 3. Prisma looks up a
record matching both the requested ID and current user's ID. 4. The page
renders the title, company, and saved content.

**Deletion** 1. The user opens the delete confirmation dialog. 2.
Confirming calls `deleteCoverLetter(id)`. 3. The server action verifies
the user and scopes the delete operation to that user. 4. The UI
displays feedback and refreshes the listing.

------------------------------------------------------------------------

## Project Structure

The following tree includes paths observed in the shared code and
representative locations for related modules. It is not guaranteed to
include every file in the repository.

``` text
sensai/
├── app/
│   ├── layout.js
│   ├── lib/
│   │   ├── helper.js
│   │   └── schema.js
│   └── (main)/
│       ├── resume/
│       │   ├── page.jsx
│       │   └── _components/
│       │       ├── resume-builder.jsx
│       │       └── entry-form.jsx
│       └── ai-cover-letter/
│           ├── page.jsx
│           ├── [id]/
│           │   └── page.jsx
│           ├── new/
│           │   └── ... 
│           └── _components/
│               ├── cover-letter-list.jsx
│               └── cover-letter-preview.jsx
├── actions/
│   ├── resume.js
│   └── cover-letter.js
├── components/
│   ├── header.jsx
│   └── ui/
│       ├── button.jsx
│       └── alert-dialog.jsx
├── hooks/
│   └── use-fetch.js
├── lib/
│   └── prisma.js
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
└── README.md
```

### Important directories

  ---------------------------------------------------------------------
  Path                               Responsibility
  ---------------------------------- ----------------------------------
  `app/`                             Next.js routes, layouts,
                                     route-level UI, and shared
                                     application helpers

  `app/(main)/resume/`               Resume builder route and its
                                     client components

  `app/(main)/ai-cover-letter/`      Cover-letter listing, creation,
                                     and individual cover-letter routes

  `actions/`                         Server actions for authenticated
                                     data access and AI operations

  `components/`                      Shared interface components such
                                     as the header

  `components/ui/`                   Reusable UI primitives, buttons,
                                     cards, and dialogs

  `hooks/`                           Reusable client hooks such as the
                                     project's `useFetch`

  `lib/prisma.js`                    Prisma client setup

  `prisma/`                          Prisma schema and related database
                                     configuration
  ---------------------------------------------------------------------

------------------------------------------------------------------------

## Key Modules

### `actions/resume.js`

Observed responsibilities:

-   `saveResume(content)` --- saves or updates the current user's
    resume.
-   `getResume()` --- retrieves the current user's resume.
-   `improveWithAI({ current, type })` --- requests AI-assisted text
    improvement.

The actions use Clerk authentication and Prisma. The AI improvement
action uses the configured Google Generative AI model.

### `app/(main)/resume/_components/resume-builder.jsx`

Observed responsibilities:

-   Manages resume form and preview state.
-   Uses React Hook Form and the project's resume schema.
-   Composes resume sections into Markdown.
-   Calls the save action.
-   Provides AI-improvement controls for supported fields.
-   Exports the Markdown-rendered resume to PDF.

### `app/(main)/resume/_components/entry-form.jsx`

Observed responsibilities:

-   Manages repeated entries such as experience, education, and
    projects.
-   Validates entry fields using the configured schema.
-   Provides the AI-improvement interaction for entry descriptions.
-   Sends updated entries back to the parent form.

### `actions/cover-letter.js`

Observed responsibilities:

-   `generateCoverLetter(data)` --- generates and persists a cover
    letter.
-   `getCoverLetters()` --- lists cover letters for the current user.
-   `getCoverLetter(id)` --- retrieves a specific cover letter scoped to
    the current user.
-   `deleteCoverLetter(id)` --- deletes a cover letter scoped to the
    current user.

### `app/(main)/ai-cover-letter/_components/cover-letter-list.jsx`

Observed responsibilities:

-   Displays saved cover letters.
-   Formats creation dates.
-   Navigates to a selected cover letter.
-   Opens a delete confirmation dialog.
-   Calls the delete action and refreshes the listing.

### `lib/prisma.js`

Provides the Prisma client imported by server-side actions. Database
connection details should be supplied through environment configuration
rather than hard-coded in source files.

------------------------------------------------------------------------

## Data and Persistence

The shared code confirms these application entities:

### User

The application user is associated with a Clerk identity through
`clerkUserId`. The cover-letter generation action reads profile context
including industry, experience, skills, and biography fields.

### Resume

The resume is associated with the application user's database ID. The
save action uses an upsert keyed by `userId`, so the same user can
create or update their resume through that operation.

### Cover Letter

The cover-letter action reads and writes fields including:

-   `content`
-   `jobDescription`
-   `companyName`
-   `jobTitle`
-   `status`
-   `userId`
-   `createdAt` (used to sort the listing)

The complete schema, relations, indexes, constraints, and any additional
fields should be verified in `prisma/schema.prisma`.

------------------------------------------------------------------------

## Authentication and Authorization

Clerk is used to authenticate requests. The server actions shown in the
shared code call `auth()` and reject requests without a `userId`.

For database access, the action resolves the Clerk identity to an
application user record. Cover-letter reads and deletes include the
application user's database ID in their filters. This is important
because knowing a cover-letter ID alone should not grant access to
another user's record.

Security practices to maintain:

-   Keep protected database operations on the server.
-   Never expose database credentials or the Gemini API key to
    client-side code.
-   Continue scoping private record reads and writes to the
    authenticated user.
-   Validate and constrain user input before using it in prompts or
    database writes.
-   Treat AI output as untrusted content and render it safely.
-   Return user-friendly errors to the UI while keeping sensitive
    details out of client responses.

------------------------------------------------------------------------

## AI Integration

The project uses the Google Generative AI SDK with the model configured
in the shared code:

``` js
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
```

AI functionality currently documented from the shared source includes:

-   Improving resume content based on a requested content type.
-   Generating a job-specific cover letter using job details and
    candidate profile context.

Prompts are assembled server-side, and the API key is read from an
environment variable. Model availability, quotas, API behavior, and
exact model identifiers depend on the provider configuration and may
change over time.

------------------------------------------------------------------------

## Rendering and Navigation

The project uses Next.js App Router pages and React components.

-   Route pages load or compose page-specific data and UI.
-   Client components handle interactive forms, dialogs, and button
    events.
-   Server actions perform authenticated server-side operations.
-   React `Suspense` boundaries can isolate asynchronous sections and
    display a fallback while those sections load.

For the cover-letter listing route, the data-dependent list is wrapped
in `Suspense`, while the page heading and creation link render outside
that boundary. The individual cover-letter route can use the same
pattern around the component that fetches the requested letter.

`Suspense` affects loading presentation and rendering boundaries; it
does not cache private database records or make database and AI requests
complete faster by itself.

------------------------------------------------------------------------

## Environment Configuration

Create a local environment file and configure the values required by the
project. Do not commit real credentials.

Variables observed in the shared code or configuration include:

``` env
# Database connection string provided by your PostgreSQL/Neon project
DATABASE_URL=""

# Google Generative AI API key
GEMINI_API_KEY=""

# Add the Clerk keys required by your existing Clerk setup:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
# CLERK_SECRET_KEY=""
```

Use the exact variable names required by the current Clerk and Prisma
configuration in your repository. Some projects also configure a
separate direct database URL or additional Clerk URL settings; include
those only if your project requires them.

**Never paste real values into documentation, screenshots, commits, or
public issue reports.**

------------------------------------------------------------------------

## Local Development

### Prerequisites

-   Node.js version compatible with the project's `package.json`
-   npm
-   Access to the configured PostgreSQL database
-   Clerk application credentials
-   Google Generative AI API key

### Install dependencies

``` bash
npm install
```

### Generate Prisma Client

``` bash
npx prisma generate
```

### Validate the Prisma schema

``` bash
npx prisma validate
```

If the project uses Prisma migrations, review its schema and database
setup before running any migration command. Do not run destructive
database commands against a database containing data you need to
preserve.

### Start the development server

``` bash
npm run dev
```

Open the local URL printed by Next.js in the terminal, commonly
`http://localhost:3000`.

### Production build

``` bash
npm run build
npm run start
```

The exact scripts available depend on `package.json`.

------------------------------------------------------------------------

## Operational Notes

### Database connectivity

A Prisma connection error means the app could not connect to the
configured database at the time of the request. Verify the Neon
project/branch, connection string, credentials, network access, and
environment variables before changing application queries.

### PDF export

The resume builder uses `html2pdf.js` to export a rendered Markdown
element. PDF rendering libraries do not necessarily support every modern
CSS color syntax. If export fails on a color function, address
compatibility in the PDF-rendering path without unnecessarily changing
the application's global theme.

### Hydration errors

React hydration warnings mean the server-rendered HTML differs from the
first client render, or the markup contains invalid nesting. Buttons
must not be nested inside other buttons. Dialog triggers should follow
the API supported by the installed UI primitive version.

### Navigation performance warnings

Next.js may warn when uncached asynchronous data blocks instant
navigation. Use appropriately placed `Suspense` boundaries for streaming
where supported by the project's Next.js version. Do not
indiscriminately cache authenticated user data, since incorrect caching
can expose one user's private data to another.

------------------------------------------------------------------------

## Security Considerations

-   Keep `.env` and `.env.local` out of version control.
-   Rotate credentials if they have been accidentally committed or
    shared.
-   Avoid exposing stack traces, database URLs, API keys, or provider
    responses to users.
-   Enforce authorization in server actions rather than relying only on
    UI visibility.
-   Ensure all read, update, and delete operations check record
    ownership.
-   Validate user-supplied job descriptions and form values.
-   Review AI-generated content before using it in job applications.
-   Use appropriate rate limits and provider quota controls for AI
    requests.

------------------------------------------------------------------------

## Future Documentation Improvements

To make this README a fully verified architectural reference, review the
current repository and add:

-   The complete Prisma data model and entity relationship diagram.
-   The exact full directory tree.
-   The complete route inventory, including the new-cover-letter route.
-   Required environment variables verified against the actual code.
-   Exact npm scripts and supported Node.js version from `package.json`.
-   Automated test commands and current test coverage.
-   Deployment steps for the chosen hosting platform.
-   Screenshots of the resume builder, AI improvement controls, PDF
    export, and cover-letter workflows.

------------------------------------------------------------------------

## Summary

SENSAI combines a Next.js App Router interface with Clerk
authentication, Prisma-backed persistence, and Gemini-powered text
generation. Its resume workflow supports structured editing, AI-assisted
improvements, Markdown preview, saving, and PDF export. Its cover-letter
workflow supports generation from job details, persistent storage,
listing, viewing, and deletion.

The architecture keeps interactive UI in React components and protected
operations in server-side actions, with user-specific database queries
enforcing ownership at the data-access layer.
