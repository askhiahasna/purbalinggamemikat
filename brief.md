# Purbalingga Memikat --- Project Initialization

## Project Overview

**Purbalingga Memikat** is a tourism and regional-potential information
platform for Purbalingga Regency, Central Java, Indonesia.

The platform will introduce and promote:

-   Tourism destinations
-   Local culinary and souvenirs
-   Culture, arts, and events
-   Regional profile, geography, and statistics
-   Local businesses and UMKM
-   Economic potential and investment opportunities

The application will consist of two main interfaces:

1.  **Public Website** --- a responsive website for visitors and
    tourists.
2.  **Admin Backoffice (CMS)** --- a content-management interface for
    authorized administrators and editors.

## Technology Stack

-   **IDE:** Google Antigravity
-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **Database:** PostgreSQL
-   **ORM:** Prisma

Use stable, compatible versions and explain any significant version or
dependency choices before installation.

## Design Direction

Create a modern, elegant, visually appealing, and professional tourism
website.

The visual identity should communicate:

-   Purbalingga's local identity
-   Natural beauty and tourism
-   Cultural richness
-   A modern digital tourism experience

### Typography

Use these typography preferences:

-   **Federo:** brand identity
-   **Poppins:** supporting headings and introductory text
-   **DM Serif Display:** main editorial headings
-   **Montserrat:** body text and small information

### Visual Principles

-   Clean layouts and clear visual hierarchy
-   Generous whitespace and consistent spacing
-   High-quality destination photography
-   Attractive but accessible color contrast
-   Consistent components and interaction patterns
-   Responsive layouts for desktop, tablet, and mobile

Do not invent official brand colors or government identity assets. If
they have not been provided, propose a temporary palette and clearly
label it as a proposal.

## Planned Public Website Features

The following is the intended product scope. Do not implement all
features in the initial setup.

### 1. Main Content

-   Homepage with hero image/video, Regent's welcome message,
    statistics, and featured destinations
-   Regional profile: history, geography, districts, and demographics
-   Nature tourism, water tourism, caves, tourist villages, and parks
-   Local culinary and souvenirs
-   Culture, arts, and event calendar
-   Economy and investment potential
-   UMKM and featured local products

### 2. Destination Detail Pages

-   Photo gallery
-   Ticket prices, opening hours, and facilities
-   Accessibility information
-   Location map and directions
-   Weather information and recommended visiting time
-   Visitor reviews and ratings
-   Nearby destinations and related recommendations
-   Social sharing
-   Destination manager contact

### 3. Interactive Visitor Features

-   Interactive map with category and district filters
-   Search and filtering by category, price, district, and keyword
-   GPS-based "near me" search
-   Saved destinations / wishlist
-   Accommodation directory

### 4. Media and Information

-   News and articles
-   Photo and video gallery
-   Email newsletter

### 5. Technical and User Experience

-   Responsive mobile-first experience
-   Indonesian and English language support; Banyumasan may be
    considered later
-   SEO and structured data
-   Image and performance optimization
-   PWA and offline support (later phase)
-   Dark mode (later phase)
-   Accessibility improvements aligned with WCAG
-   Instagram and YouTube integration
-   Visitor analytics
-   HTTPS, CAPTCHA where appropriate, and routine backups

### 6. Public Services

-   Contact and complaint forms
-   Self-registration for tourism operators and UMKM
-   Tourist satisfaction survey
-   FAQ
-   Emergency contacts and Tourist Information Center (TIC) information

## Planned Admin Backoffice (CMS)

The CMS is expected to support:

-   Admin authentication
-   Role-based access for department administrators, editors, and
    destination managers
-   Dashboard and visitor statistics
-   Destination management
-   Culinary management
-   Event management
-   News and article management
-   UMKM and product management
-   Banner, slider, and announcement management
-   Review and comment moderation
-   Excel/CSV import and export
-   Management of public-service submissions

Plan authorization carefully. Users should only be able to access
actions and records permitted by their roles.

## Development Principles

1.  Use a scalable, maintainable architecture without unnecessary
    complexity.
2.  Separate public website and admin backoffice layouts.
3.  Build reusable components and consistent design tokens.
4.  Use TypeScript types appropriately; avoid unnecessary `any`.
5.  Use PostgreSQL with Prisma ORM.
6.  Store secrets and environment-specific configuration in environment
    variables.
7.  Never commit database credentials, API keys, or other secrets.
8.  Validate and sanitize user input on the server.
9.  Enforce authorization on the server, not only by hiding UI elements.
10. Use clearly identified placeholder/dummy content during development.
11. Public-facing content should eventually come from PostgreSQL/CMS,
    not remain permanently hardcoded.
12. Keep the application accessible, responsive, and performant.
13. Avoid installing dependencies unless they are needed and their
    purpose is explained.
14. Do not overwrite or delete existing files without inspecting them
    and explaining the impact.
15. Work in small, reviewable phases. Explain what changed and how to
    test it after each phase.

## Initial Task: Project Foundation and Architecture

You are acting as a Senior Full-Stack Developer and Software Architect.
I am developing this project in **Google Antigravity IDE**.

Before implementing the application, complete the following:

1.  Inspect the current workspace and determine whether it is empty or
    contains existing files.
2.  Check the installed Node.js and npm versions.
3.  Check whether PostgreSQL is installed and available. Do not assume
    it is configured.
4.  Recommend a suitable Next.js project setup using the App Router and
    TypeScript.
5.  Propose a scalable folder structure.
6.  Explain how public routes and admin routes/layouts should be
    organized.
7.  Propose an initial PostgreSQL data model at a high level, including
    likely entities and relationships. Do not create every table yet.
8.  Identify the required dependencies and explain why each is needed.
9.  Explain environment-variable setup and safe handling of credentials.
10. Provide a phased implementation roadmap, including the landing page
    and CMS.

### Important Constraints

-   **Do not build the full application yet.**
-   **Do not create database tables or run migrations yet.**
-   **Do not generate large amounts of code before presenting the
    architecture.**
-   **Do not assume official content, images, statistics, or government
    assets are available.**
-   **Do not fabricate real-world information about Purbalingga.** Use
    clearly labeled placeholders until verified data is supplied.
-   **Do not deploy or publish anything.**
-   Present the proposed architecture, folder structure, database
    outline, dependencies, setup commands, and roadmap first.
-   Explain the plan in Indonesian.
-   Wait for my approval before proceeding with project initialization
    or implementation.

## Expected First Response

Present the result in this order:

1.  Workspace and environment inspection
2.  Recommended project configuration
3.  Proposed folder structure
4.  Public website and admin route organization
5.  Initial database entity outline and relationships
6.  Required dependencies
7.  Setup commands
8.  Phased development roadmap
9.  Risks, assumptions, and decisions that need my approval

Keep explanations clear and practical. I am a developer who wants to
understand and maintain the project, so do not make architectural
decisions silently.
