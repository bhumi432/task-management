# Team Task Manager — PRD (Product Requirements Document)

## 1) Overview
Team Task Manager is a full‑stack web application where authenticated users create projects, manage team members, create and assign tasks, and track progress with role-based access (ADMIN / MEMBER).

## 2) Goals
- Provide a simple workflow to **create projects**, **invite team members**, and **manage tasks**.
- Ensure **secure authentication** and **role-based authorization**.
- Provide a **dashboard summary** for task progress and overdue visibility.

## 3) Personas & roles
- **ADMIN**
  - Can create projects
  - Can add/remove project team members
  - Can perform everything a MEMBER can
- **MEMBER**
  - Can view projects they belong to
  - Can create tasks in projects they belong to
  - Can assign tasks (within the same project) and update status

## 4) User stories
### Authentication
- As a user, I can sign up with name/email/password.
- As a user, I can log in to receive a JWT-based session (stored as an HTTP-only cookie in the frontend).

### Projects & teams
- As an ADMIN, I can create a project.
- As an ADMIN, I can add/remove members to/from a project.
- As a MEMBER, I can only view projects I belong to.

### Tasks
- As a project member, I can create tasks in a project.
- As a project member, I can assign/unassign tasks to project members.
- As a project member, I can update task status (TODO / IN_PROGRESS / DONE).
- As a project member, I can filter tasks by project, assignee, status, and “overdue”.

### Dashboard
- As a user, I can view a summary: total/completed/pending/overdue tasks scoped to my projects.

## 5) Functional requirements
### 5.1 Authentication
- **Signup**
  - Inputs: name, email, password
  - Validations: email format, password length, name length
  - Password stored hashed (bcrypt)
- **Login**
  - Inputs: email, password
  - Output: access token + user info
- **JWT auth**
  - Bearer token for backend API calls
  - Frontend stores token in **HTTP-only cookie** via Next.js route handlers

### 5.2 Authorization (RBAC)
- ADMIN-only actions:
  - Create project
  - Add/remove team members
- Membership restriction:
  - Users may only read/write tasks/projects that belong to projects they are a team member of.

### 5.3 Project management
- Create project with name + optional description
- Add team members by userId
- Remove team members by userId

### 5.4 Task management
- Create task with title, optional description, optional dueDate, required projectId
- Assign/unassign to a user (must be team member)
- Update status
- Filtering:
  - projectId
  - assignedToId
  - status
  - overdue: dueDate < now AND status != DONE

### 5.5 Dashboard summary
Return counts scoped to the current user’s projects:
- totalTasks
- completedTasks
- pendingTasks
- overdueTasks

## 6) Non-functional requirements
- **Security**
  - Passwords hashed with bcrypt
  - JWT secret must be provided via env
  - HTTP-only cookies used by frontend to avoid token access from JS
- **Validation**
  - Backend uses global ValidationPipe: whitelist + forbidNonWhitelisted + transform
- **Performance**
  - Use Prisma aggregates (`count`, `groupBy`) for dashboard
  - Use indexed columns for filters (`projectId`, `assignedToId`, `email`)

## 7) Data model (Prisma)
Core entities:
- **User**: id (uuid), name, email(unique), password, role
- **Project**: id, name, description, createdById
- **Task**: id, title, description, status, dueDate, assignedToId, projectId
- **TeamMember**: join table for User ↔ Project membership

Relationships:
- User → Project: createdProjects (1:N)
- User → Task: assignedTasks (1:N)
- Project → Task: tasks (1:N)
- User ↔ Project: M:N via TeamMember

Delete behavior:
- Project delete cascades to tasks and team membership
- User delete cascades to membership; task assignments set null

## 8) API (current implementation)
### Auth
- `POST /auth/signup`
- `POST /auth/login`

### Projects
- `POST /projects` (ADMIN)
- `GET /projects` (member-scoped)
- `POST /projects/:projectId/members` (ADMIN)
- `DELETE /projects/:projectId/members/:userId` (ADMIN)

### Tasks
- `POST /tasks` (member-scoped)
- `GET /tasks` (member-scoped + filters)
- `PATCH /tasks/:id/assign` (member-scoped)
- `PATCH /tasks/:id/status` (member-scoped)

### Dashboard
- `GET /dashboard/summary` (member-scoped)

## 9) Frontend (App Router)
Routes:
- `/login`, `/signup`
- `/dashboard`, `/projects`, `/tasks`

Auth handling:
- Next.js route handlers proxy to backend and set `access_token` as HTTP-only cookie:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`

## 10) Environment variables
Backend (`.env`):
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Frontend (`frontend/.env.local`):
- `API_URL` (server-side route handlers)
- `NEXT_PUBLIC_API_URL` (if needed for client calls; recommended to prefer server route handlers)

## 11) Acceptance criteria (high-level)
- A new user can sign up and log in successfully.
- ADMIN can create projects and manage team membership.
- MEMBER cannot create projects or change team members.
- Users only see projects/tasks they belong to.
- Tasks can be created, assigned, updated, filtered, and overdue computed correctly.
- Dashboard summary counts match task data for the user’s projects.

