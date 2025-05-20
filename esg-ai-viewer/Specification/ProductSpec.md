# ESG AI Viewer — Product Specification & Wireframe Model

## Overview
ESG AI Viewer is a web application for interacting with ESG AI through a chat interface, integrated with n8n workflows. The application provides authenticated access, company selection, chat, research, and reporting features, with a modular, Angular-based UI.

---

## Main Features
- **Azure AD Authentication**
- **Company Selector**
- **Chat with ESG AI**
- **Tabbed Data Views (Question, Summary, Report, Raw)**
- **Research Home**
- **Public Home**
- **About, Links Pages**
- **Responsive Header and Navigation**
- **Theme Support**

---

## Main Navigation / Pages
1. **Home (Public & Research)**
2. **Chat**
3. **Tabs (Question, Summary, Report, Raw)**
4. **About**
5. **Links**

---

## Page & Component Specifications

### 1. Header
- **Components:**
  - App logo/title
  - Navigation links (Home, Chat, Research, About, Links)
  - Company Selector (dropdown)
  - User info (profile, logout)
  - Theme toggle (light/dark)
- **Behavior:**
  - Responsive, sticky at top
  - Shows user info when authenticated
  - Allows company switching
  - Navigation updates main view

**Wireframe:**
```
+-------------------------------------------------------------+
| ESG AI Viewer | Home | Chat | Research | ... | [Company v] |
| [User] [Theme]                                      [Logout]|
+-------------------------------------------------------------+
```

---

### 2. Home (Public & Research)
- **Components:**
  - Welcome message
  - Quick links to main features
  - Company Selector
  - (Research Home) — additional research tools, recent activity
- **Behavior:**
  - Public Home is accessible to all
  - Research Home is for authenticated users

**Wireframe:**
```
+-------------------+
| Welcome, [User]!  |
| [Company v]       |
| [Quick Links]     |
| [Recent Research] |
+-------------------+
```

---

### 3. Chat Page
- **Components:**
  - Chat message list
  - Input box for user message
  - Send button
  - Company Selector
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

### 4. Tabs View (Question, Summary, Report, Raw)
- **Components:**
  - Tab navigation (Question, Summary, Report, Raw)
  - Each tab has its own component:
    - **Question Tab:**
      - User can enter a question related to the selected company.
      - Company Selector to choose the context.
      - Submit button to send the question.
      - Displays AI-generated answer.
      - **Behavior:**
        - On submit, calls the API to process the question for the selected company.
        - Shows a spinner/loading indicator while waiting for the response.
        - Displays error messages if the API call fails.
        - Supports markdown rendering in the answer.
    - **Summary Tab:**
      - User selects a company (Company Selector).
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
      - User selects a company (Company Selector).
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
      - User selects a company (Company Selector).
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

### 5. About Page
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

### 6. Links Page
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
- **Company Selector:** Dropdown for switching company context
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
- **Login:** User authenticates via Azure AD, lands on Research Home
- **Select Company:** User selects company, all data/views update
- **Chat:** User sends messages, receives AI responses
- **View Data:** User navigates tabs for different ESG data views
- **Export/Download:** (If available) User exports data from tabs

---

## Accessibility & Responsiveness
- All pages/components are responsive
- Keyboard navigation and ARIA labels for accessibility

---

## Wireframe Summary
- All main pages have a clear header, navigation, and context selector
- Content is modular, with tabs for data views and reusable components

---

## Future Enhancements (Optional)
- Notification system
- User settings/preferences
- Advanced filtering/search
- More granular permissions/roles

---

*This document provides a high-level product specification and wireframe model for the ESG AI Viewer, ensuring all features, pages, and components are clearly defined for design, development, and stakeholder review.* 