# ESG AI Viewer — Product Specification & Wireframe Model

## Overview
ESG AI Viewer is a web application for interacting with ESG AI through a chat interface, integrated with n8n workflows. The application provides authenticated access, company selection, chat, research, and reporting features, with a modular, Angular-based UI.

---

## Main Features
- **Azure AD Authentication**
- **Login Button and Process on Public Home**
- **Company Selector (Authenticated Views Only)**
- **Chat with ESG AI**
- **Tabbed Data Views (Question, Summary, Report, Raw) — Research Only**
- **Research Home (Logged-in users only)**
- **Public Home (All users)**
- **About, Links Pages**
- **Responsive Header and Navigation**
- **Theme Support**

---

## Main Navigation / Pages
1. **Public Home (All Users)**
2. **Research Home (Logged-in Users)**
   - Tabs View (Question, Summary, Report, Raw)
3. **Chat**
4. **About**
5. **Links**

---

## Page & Component Specifications

### 1. Header
- **Components:**
  - App logo/title
  - Navigation links (Home, Chat, Research, About, Links)
  - **Company Selector (only visible after login)**
  - User info (profile, logout)
  - Theme toggle (light/dark)
- **Behavior:**
  - Responsive, sticky at top
  - Shows user info when authenticated
  - Allows company switching (authenticated views only)
  - Navigation updates main view

**Wireframe:**
```
+-------------------------------------------------------------+
| ESG AI Viewer | Home | Chat | Research | ... | [Login]     |
| [User] [Theme]                                      [Logout]|
+-------------------------------------------------------------+
```

---

## 2. Public Home Page (All Users)
- **Components:**
  - Welcome message
  - Quick links to main features
  - **Login button**
- **Behavior:**
  - Accessible to all users (no login required)
  - Provides general information and navigation
  - **No Company Selector is shown on this page**
  - Login button initiates the Azure AD authentication process
  - After successful login, user is redirected to the Research Home

**Wireframe:**
```
+-------------------+
| Welcome!          |
| [Quick Links]     |
| [Login Button]    |
+-------------------+
```

**Login Process:**
- User clicks the **Login** button
- Redirects to Azure AD login page
- On successful authentication, user is redirected back to the app and lands on the Research Home page
- The Company Selector and authenticated features become available

---

## 3. Research Page (Logged-in Users Only)
- **Components:**
  - Welcome message with user info
  - Quick links to research features
  - **Company Selector (visible only after login)**
  - Recent research activity
  - **Tabs View (see below)**
- **Behavior:**
  - Only accessible to authenticated users
  - Shows user-specific and company-specific research tools
  - Company Selector is available for switching context

**Wireframe:**
```
+-------------------+
| Welcome, [User]!  |
| [Company v]       |
| [Quick Links]     |
| [Recent Research] |
| [Tabs View]       |
+-------------------+
```

### Tabs View (Research Page Only)
- **Components:**
  - Tab navigation (Question, Summary, Report, Raw)
  - Each tab has its own component:
    - **Question Tab:**
      - User can enter a question related to the selected company.
      - **Company Selector to choose the context.**
      - Submit button to send the question.
      - Displays AI-generated answer.
      - **Behavior:**
        - On submit, calls the API to process the question for the selected company.
        - Shows a spinner/loading indicator while waiting for the response.
        - Displays error messages if the API call fails.
        - Supports markdown rendering in the answer.
    - **Summary Tab:**
      - **User selects a company (Company Selector).**
      - User selects summary length (e.g., Short, Medium, Long).
      - User selects RAG (Red-Amber-Green) options (e.g., All, Only Red, Only Green).
      - 'Generate' button to process the summary.
      - Displays the generated summary.
      - **Behavior:**
        - On clicking 'Generate', calls the API method to generate the summary for the selected company, length, and RAG options.
        - Shows a spinner/loading indicator while the summary is being generated.
        - Disables the 'Generate' button during processing.
        - Displays error messages if the API call fails.
        - Supports markdown rendering in the summary.
    - **Report Tab:**
      - **User selects a company (Company Selector).**
      - User can select report type or date range (if available).
      - 'Generate Report' button to process the report.
      - Displays the detailed ESG report.
      - **Behavior:**
        - On clicking 'Generate Report', calls the API to fetch/generate the report for the selected company and options.
        - Shows a spinner/loading indicator while the report is being generated.
        - Disables the 'Generate Report' button during processing.
        - Displays error messages if the API call fails.
        - Allows export/download of the report (if available).
    - **Raw Tab:**
      - **User selects a company (Company Selector).**
      - Displays raw ESG data for the selected company.
      - **Behavior:**
        - Calls the API to fetch raw data for the selected company.
        - Shows a spinner/loading indicator while loading data.
        - Displays error messages if the API call fails.
        - Allows export/download of raw data (if available).

- **Behavior:**
  - Tabs switch content without page reload
  - Data is loaded per company selection
  - Each tab may have export/download options

**Wireframe:**
```
+---------------------------------------------+
| [Company v]  [Question] [Summary] ...       |
| +-----------------------------------------+ |
| | [Tab Content: Q&A, Summary, etc.]       | |
| +-----------------------------------------+ |
+---------------------------------------------+
```

---

## 4. Chat Page
- **Components:**
  - Chat message list
  - Input box for user message
  - Send button
  - **Company Selector (authenticated only)**
- **Behavior:**
  - Authenticated users can send/receive messages
  - Messages are sent to ESG AI via n8n webhook
  - Supports markdown rendering

**Wireframe:**
```
+-------------------------------+
| [Company v]                   |
| [Chat Messages]               |
| [Input Box] [Send]            |
+-------------------------------+
```

---

## 5. About Page
- **Components:**
  - Application description
  - Team info
  - Version/build info
- **Behavior:**
  - Static content, may pull build info from service

**Wireframe:**
```
+--------------------------+
| About ESG AI Viewer      |
| [Team] [Version Info]    |
+--------------------------+
```

---

## 6. Links Page
- **Components:**
  - List of useful links (external/internal)
  - Categories or tags
- **Behavior:**
  - Click to open in new tab

**Wireframe:**
```
+-------------------+
| [Links List]      |
+-------------------+
```

---

## Shared Components
- **Company Selector:** Dropdown for switching company context (authenticated views only)
- **Chat Component:** Used in chat page and possibly in tabs
- **Header:** Navigation, user info, theme
- **Tabs:** For switching between Question, Summary, Report, Raw

---

## Services
- **Auth Service:** Handles login, logout, token management
- **Company Service:** Loads company data
- **ESG Service:** Fetches ESG data, reports, summaries
- **Config Service:** Loads environment config
- **Theme Service:** Manages theme switching

---

## User Flows
- **Login:** User clicks Login, authenticates via Azure AD, lands on Research Home
- **Select Company:** User selects company, all data/views update (authenticated only)
- **Chat:** User sends messages, receives AI responses
- **View Data:** User navigates tabs for different ESG data views
- **Export/Download:** (If available) User exports data from tabs

---

## Accessibility & Responsiveness
- All pages/components are responsive
- Keyboard navigation and ARIA labels for accessibility

---

## Wireframe Summary
- All main pages have a clear header, navigation, and context selector (where appropriate)
- Content is modular, with tabs for data views and reusable components

---

## Future Enhancements (Optional)
- Notification system
- User settings/preferences
- Advanced filtering/search
- More granular permissions/roles

---

*This document provides a high-level product specification and wireframe model for the ESG AI Viewer, ensuring all features, pages, and components are clearly defined for design, development, and stakeholder review.* 