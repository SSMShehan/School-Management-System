# School Management System

This is a comprehensive, full-stack educational administration platform designed to streamline the operations of schools and educational institutions. It solves the critical problem of fragmented school management by unifying student enrollments, staff administration, real-time attendance tracking, and financial operations (fee collections) into a single, cohesive dashboard with multi-branch support.

## Tech Stack

### Frontend
*   **Framework:** React 19, Vite
*   **Routing & State:** React Router v7, React Query (TanStack Query)
*   **Styling:** Tailwind CSS v4
*   **Forms & Validation:** React Hook Form, Zod
*   **Utilities:** Axios, Date-fns, Lucide React

### Backend
*   **Framework:** FastAPI (Python)
*   **Server:** Uvicorn (ASGI)
*   **Data Validation:** Pydantic
*   **Authentication:** JWT (python-jose), Argon2 (passlib)
*   **Utilities:** ReportLab (PDF Generation), OpenPyXL (Excel Generation)

### Database & ORM
*   **Database:** PostgreSQL (via `psycopg2-binary`)
*   **ORM:** SQLAlchemy
*   **Migrations:** Alembic

## Key Features & Core Functionalities

*   **Student & Staff Administration:** Complete system for managing student admissions, demographics, grade levels, and staff records. 
*   **Financial & Payment Processing:** Robust fee structure management and payment processing that automatically generates unique receipt numbers, tracks pending/paid statuses, and issues digital receipts.
*   **Multi-Branch Data Isolation:** A hierarchical structure that supports operating multiple school branches. Administrative users can view all data, while branch-level staff are restricted to viewing and modifying records strictly within their assigned branch.
*   **Comprehensive Automated Reporting:** On-demand generation of stylized, downloadable PDF and Excel reports for financial income summaries, payment histories, and student registries.
*   **Attendance Tracking:** Dedicated workflows for logging and monitoring daily attendance records for both students and staff members.
*   **Role-Based Access Control (RBAC):** Secure authentication flow ensuring specific endpoints and data mutations are strictly protected by administrative roles.
*   **AI Tools Integration:** An integrated suite of AI tools built into the frontend interface to assist with automated administrative tasks or data insights.

## Technical Architecture & Patterns

*   **Backend Architecture:** The backend follows a modern **Controller-Service-ORM Pattern**. Logic is modularized into distinct directories: `models` (SQLAlchemy ORM definitions), `schemas` (Pydantic validation schemas), and `routes` (API controllers). Database sessions and user authentication are handled efficiently using FastAPI's Dependency Injection.
*   **Frontend Architecture:** The frontend utilizes a **Feature-Sliced or Modular Pattern**. Application logic is separated by domain into a `src/features/` directory (e.g., `features/auth`, `features/payments`, `features/students`), ensuring high maintainability and scalability.
*   **API Design:** The application acts as a decoupled SPA (Single Page Application) communicating with the backend over a **RESTful API** architecture.

## Engineering Complexities & Challenges

*   **Multi-Tenant Branch Architecture:** Handling data isolation across different school branches is achieved dynamically by intercepting the current user's JWT token via dependency injection. This automatically appends branch-specific SQLAlchemy filters to all database queries, ensuring strict data security.
*   **Dynamic Report Generation & Streaming:** Generating financial "Income Summary" and "Payment Receipts" involves drawing pixel-perfect canvases and aggregating multi-table database queries. The resulting binary buffers are streamed directly to the client via `StreamingResponse`, avoiding saving temporary files to the server's disk and optimizing memory usage.
*   **Synchronized Type Safety:** On the frontend, `Zod` combined with `React Hook Form` handles strict client-side validations. This schema maps exactly to the server-side `Pydantic` models in FastAPI, creating an end-to-end type-safe pipeline that prevents malformed database entries.
