# ESG AI Viewer Application Specification

## 1. Overview

The ESG AI Viewer is a single-page web application built with Angular, designed to allow users to select a company, retrieve its Environmental, Social, and Governance (ESG) data, and view the data in multiple formats. The application will feature a clean, professional design inspired by www.lgt.com, with a header for company selection and four tabs for data visualization and interaction. The Report and Summary tabs will render Markdown responses, with `\n` replaced by carriage returns for proper formatting.

## 2. Functional Requirements

### 2.1 Header Section

- **Company Selection**:
  - A dropdown combo box for selecting a company, implemented using Angular Material's `mat-select` or `mat-autocomplete`.
  - Supports text input to filter the company list dynamically (e.g., typeahead functionality).
  - Populated by an API call (to be specified) or a static list if no API is provided.
- **Clear Button**:
  - Resets the application state:
    - Clears the selected company.
    - Resets all tabs to their initial state.
    - Clears any displayed data.
- **Design**:
  - Consistent with www.lgt.com styling (clean, professional, minimalistic, with a focus on typography and subtle color palette).

### 2.2 Tabs

The application will feature four tabs below the header, each displaying different views of the ESG data, implemented using Angular Material's `mat-tab-group`.

#### 2.2.1 Raw Tab

- **Functionality**:
  - Displays the raw JSON data retrieved from the ESG API after a company is selected.
  - JSON is formatted for readability (e.g., pretty-printed with indentation).
- **API Call**:
  - Triggered upon company selection.
  - API endpoint: To be specified (or placeholder until provided).
  - Response: JSON object containing ESG details for the selected company.
- **Display**:
  - Read-only, scrollable view of the JSON data.
  - Syntax highlighting using a library like `ngx-prism` or a custom component.

#### 2.2.2 Report Tab

- **Functionality**:
  - Displays a report generated from the raw JSON data, rendered as Markdown.
  - API call is made when the tab is selected.
- **API Call**:
  - Endpoint: `https://n8n.sheltononline.com/webhook/ESG/Company/Summary/Report`
  - Method: POST
  - Body: Raw JSON from the Raw Tab.
  - Response: Markdown text.
- **Display**:
  - Renders the Markdown response after replacing `\n` with carriage returns (`\r\n`) for proper line breaks.
  - Uses an Angular Markdown rendering library (e.g., `ngx-markdown`) to convert Markdown to HTML.
  - Ensures consistent styling with www.lgt.com aesthetic (e.g., typography, spacing).

#### 2.2.3 Summary Tab

- **Functionality**:
  - Displays a summarized description of the ESG data, rendered as Markdown.
  - API call is made when the tab is selected.
- **API Call**:
  - Endpoint: `https://n8n.sheltononline.com/webhook/ESG/Company/Summary/Description`
  - Method: POST
  - Body: Raw JSON from the Raw Tab.
  - Response: Markdown text.
- **Display**:
  - Renders the Markdown response after replacing `\n` with carriage returns (`\r\n`) for proper line breaks.
  - Uses `ngx-markdown` or similar to convert Markdown to HTML.
  - Minimal styling to maintain focus on content, aligned with www.lgt.com design.

#### 2.2.4 Chat Tab

- **Functionality**:
  - Embeds an AI chatbot interface for interacting with ESG data.
  - References the N8N chatbot workflow.
- **Integration**:
  - Embeds or connects to `https://n8n.sheltononline.com/workflow/8Pkpdy3klGJe8CSm`.
  - Uses an iframe or API-based chat interface (depending on N8N capabilities).
  - Passes relevant context (e.g., selected company or raw JSON) to the chatbot.
- **Display**:
  - Chatbot UI with a conversation window and input field, implemented as an Angular component.
  - Responsive design to fit within the tab.

### 2.3 Application Flow

1. User selects a company from the dropdown or types to filter the list.
2. Upon selection, an API call retrieves the ESG JSON data, and the Raw Tab is displayed.
3. User can switch between tabs:
   - Raw: Shows the JSON data.
   - Report: Triggers the Report API, processes the Markdown response (replacing `\n` with `\r\n`), and renders it.
   - Summary: Triggers the Summary API, processes the Markdown response (replacing `\n` with `\r\n`), and renders it.
   - Chat: Loads the chatbot interface.
4. User can click the Clear button to reset the application.

## 3. Non-Functional Requirements

### 3.1 Design and Styling

- **Look and Feel**:
  - Inspired by www.lgt.com:
    - Clean, professional aesthetic.
    - Neutral color palette (e.g., whites, grays, subtle blues).
    - High-quality typography (e.g., sans-serif fonts like Helvetica or similar).
    - Minimalistic layout with ample whitespace.
- **Responsive Design**:
  - Fully responsive for desktop, tablet, and mobile devices using Angular Material's responsive utilities.
  - Dropdown and tabs adapt to smaller screens (e.g., tabs stack vertically on mobile).
- **Accessibility**:
  - WCAG 2.1 Level AA compliance.
  - Keyboard navigation for dropdown and tabs using Angular Material's built-in accessibility features.
  - ARIA labels for interactive elements.

### 3.2 Performance

- **Loading**:
  - Initial page load < 2 seconds, optimized with Angular's Ahead-of-Time (AOT) compilation.
  - API calls should include loading indicators (e.g., Angular Material spinners).
- **Caching**:
  - Cache company list (if static) using Angular's `HttpClient` with RxJS operators.
  - Cache raw JSON data locally to avoid redundant calls when switching tabs.

### 3.3 Security

- **API Calls**:
  - Use HTTPS for all API requests.
  - Include authentication headers if required by APIs (to be specified).
- **Data Handling**:
  - Sanitize Markdown-rendered HTML using Angular's `DomSanitizer` to prevent XSS attacks.
  - No storage of sensitive data beyond session scope.

## 4. Technical Requirements

### 4.1 Frontend

- **Framework**: Angular (latest stable version, e.g., Angular 17 or 18).
- **Styling**:
  - Angular Material for UI components and responsive design.
  - Custom CSS to match www.lgt.com aesthetic, applied via Angular's component-level styles.
- **Libraries**:
  - `@angular/common/http` for API calls.
  - `ngx-prism` for JSON syntax highlighting.
  - `ngx-markdown` for rendering Markdown in Report and Summary tabs.
  - Angular Material for dropdown (`mat-autocomplete` or `mat-select`), tabs (`mat-tab-group`), and buttons.
- **CDN**:
  - Use `cdn.jsdelivr.net` for Angular, Angular Material, and other dependencies.
- **Structure**:
  - Single-page application (SPA) with Angular modules and components.
  - Lazy-loaded modules for each tab to optimize performance.
  - Main component structure:
    - `AppComponent`: Root component with header and tab group.
    - `HeaderComponent`: Dropdown and Clear button.
    - `RawTabComponent`: JSON display.
    - `ReportTabComponent`: Markdown report display.
    - `SummaryTabComponent`: Markdown summary display.
    - `ChatTabComponent`: Chatbot integration.

### 4.2 API Integration

- **Company List API**:
  - Endpoint: To be specified.
  - Expected response: JSON array of company names or objects.
  - Handled by an Angular `Service` with `HttpClient`.
- **ESG Data API**:
  - Endpoint: To be specified.
  - Triggered on company selection.
  - Response: JSON with ESG details.
- **Report API**:
  - Endpoint: `https://n8n.sheltononline.com/webhook/ESG/Company/Summary/Report`
  - Method: POST
  - Body: Raw ESG JSON.
  - Response: Markdown text, processed to replace `\n` with `\r\n`.
- **Summary API**:
  - Endpoint: `https://n8n.sheltononline.com/webhook/ESG/Company/Summary/Description`
  - Method: POST
  - Body: Raw ESG JSON.
  - Response: Markdown text, processed to replace `\n` with `\r\n`.
- **Chatbot Integration**:
  - Workflow: `https://n8n.sheltononline.com/workflow/8Pkpdy3klGJe8CSm`
  - Integration method: Iframe or API (to be confirmed).
  - Handled by a dedicated Angular component.

### 4.3 Hosting

- Deployable as a static Angular application (e.g., via `ng build`).
- No server-side backend required (all logic handled client-side).

## 5. User Interface Mockup

### 5.1 Layout

| [Logo] [Company Dropdown] [Clear Button] |
| [Raw] [Report] [Summary] [Chat] |
| Tab Content Area | | (JSON, Markdown Report, Markdown Summary, or Chatbot UI) |


### 5.2 Styling Notes

- **Header**: Fixed or sticky, with a subtle shadow, styled with Angular Material's `mat-toolbar`.
- **Dropdown**: Wide, with autocomplete and hover effects using `mat-autocomplete`.
- **Tabs**: Underlined active tab, with hover states using `mat-tab-group`.
- **Content Area**: Scrollable, with padding and max-width for readability.
- **Markdown Rendering**: Styled to match www.lgt.com typography and spacing.

## 6. Assumptions and Constraints

- **Assumptions**:
  - Company list API will be provided or a static list will suffice.
  - Report and Summary APIs return valid Markdown text.
  - N8N chatbot supports iframe embedding or API integration.
- **Constraints**:
  - No server-side backend; all logic is client-side.
  - Limited to static hosting (e.g., GitHub Pages, Netlify).
  - APIs may require authentication (details TBD).

## 7. Deliverables

- Angular project structure containing:
  - `app.module.ts`: Root module.
  - Components for header, tabs, and tab content.
  - Services for API calls and state management.
  - Styles matching www.lgt.com.
  - Markdown rendering with `\n` to `\r\n` replacement logic.
- Documentation:
  - README with setup instructions (`ng serve`, `ng build`).
  - Notes on API dependencies and configuration.

## 8. Future Enhancements

- Offline support using Angular's service workers.
- Local storage for recent company selections using `localStorage`.
- Advanced filtering options for company dropdown.
- Real-time updates for ESG data (if API supports).
