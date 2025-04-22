# ESG AI Viewer Application Specification

## 1. Overview

The ESG AI Viewer is a single-page web application built with Angular, designed to allow users to select a company, retrieve its Environmental, Social, and Governance (ESG) data, and view the data in multiple formats. The application features a clean, professional design with a header for company selection and four tabs for data visualization and interaction.

## 2. Functional Requirements

### 2.1 Header Section

- **Company Selection**:
  - An autocomplete input field for selecting a company
  - Supports text input to filter the company list dynamically
  - Displays company name and ID in the format "COMPANY NAME (ID)"
- **Clear Button**:
  - Pink-colored button aligned to the right
  - Resets the application state:
    - Clears the selected company
    - Resets all tabs to their initial state
    - Clears any displayed data

### 2.2 Tabs

The application features four tabs below the header, each displaying different views of the ESG data.

#### 2.2.1 Raw Tab

- **Functionality**:
  - Displays the raw JSON data retrieved from the ESG API
  - JSON is formatted with proper indentation and syntax highlighting
- **Display**:
  - Full-width container with padding
  - Light background color for better readability
  - Scrollable content area

#### 2.2.2 Report Tab

- **Functionality**:
  - Displays a report generated from the raw JSON data
  - API call is made when the tab is selected
- **API Call**:
  - Endpoint: `https://n8n.sheltononline.com/webhook/ESG/Company/Summary/Report`
  - Method: POST
  - Body: Raw JSON data
- **Display**:
  - Full-width container with padding
  - Clean typography for easy reading
  - Refresh button in the top-right corner

#### 2.2.3 Summary Tab

- **Functionality**:
  - Displays a summarized description of the ESG data
  - Includes a word count input (250-2500 words)
  - Toggle for RAG (Retrieval Augmented Generation)
- **API Call**:
  - Endpoint: `https://n8n.sheltononline.com/webhook/ESG/Company/Summary/Description`
  - Method: POST
  - Body: Raw JSON data and settings
- **Display**:
  - Full-width container with padding
  - Settings panel at the top with word count control
  - Refresh button in the top-right corner
  - Clean typography for content

#### 2.2.4 Chat Tab

- **Functionality**:
  - Embeds an AI chatbot interface for ESG data interaction
  - Automatically includes context of the selected company
- **Integration**:
  - Endpoint: `https://n8n.sheltononline.com/webhook/047eecfa-1a30-4d08-a9fa-ab0271c4409a/chat`
  - Embedded via iframe with scaled content (0.85)
- **Display**:
  - Full-width container
  - Navy blue header with welcome message
  - White chat interface
  - Optimized height for better usability

### 2.3 Error Handling

- Loading states with spinners during API calls
- Error messages displayed in red with retry options
- Graceful fallbacks for API failures

## 3. Technical Implementation

### 3.1 Frontend

- **Framework**: Angular with Angular Material
- **Styling**:
  - Component-scoped SCSS
  - Responsive design
  - Consistent padding and spacing
- **Components**:
  - Header component with company selection
  - Tab components with specific layouts
  - Shared components for error and loading states

### 3.2 API Integration

- **ESG Data API**: Retrieves company ESG data
- **Report Generation**: Markdown-formatted report
- **Summary Generation**: Configurable summary with RAG support
- **Chat Integration**: Real-time AI chat interface

### 3.3 Styling Guidelines

- **Colors**:
  - Primary: Navy blue for headers
  - Accent: Pink for action buttons
  - Background: White/light gray for content areas
- **Typography**:
  - Sans-serif fonts for readability
  - Consistent heading sizes
  - Proper line height and spacing
- **Layout**:
  - 20px padding for containers
  - 8px border radius for cards
  - Subtle shadows for depth
  - Full-width design for optimal content display

## 4. Non-Functional Requirements

### 4.1 Design and Styling

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

### 4.2 Performance

- **Loading**:
  - Initial page load < 2 seconds, optimized with Angular's Ahead-of-Time (AOT) compilation.
  - API calls should include loading indicators (e.g., Angular Material spinners).
- **Caching**:
  - Cache company list (if static) using Angular's `HttpClient` with RxJS operators.
  - Cache raw JSON data locally to avoid redundant calls when switching tabs.

### 4.3 Security

- **API Calls**:
  - Use HTTPS for all API requests.
  - Include authentication headers if required by APIs (to be specified).
- **Data Handling**:
  - Sanitize Markdown-rendered HTML using Angular's `DomSanitizer` to prevent XSS attacks.
  - No storage of sensitive data beyond session scope.

## 5. Technical Requirements

### 5.1 Frontend

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

### 5.2 API Integration

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

### 5.3 Hosting

- Deployable as a static Angular application (e.g., via `ng build`).
- No server-side backend required (all logic handled client-side).

## 6. User Interface Mockup

### 6.1 Layout

| [Logo] [Company Dropdown] [Clear Button] |
| [Raw] [Report] [Summary] [Chat] |
| Tab Content Area | | (JSON, Markdown Report, Markdown Summary, or Chatbot UI) |


### 6.2 Styling Notes

- **Header**: Fixed or sticky, with a subtle shadow, styled with Angular Material's `mat-toolbar`.
- **Dropdown**: Wide, with autocomplete and hover effects using `mat-autocomplete`.
- **Tabs**: Underlined active tab, with hover states using `mat-tab-group`.
- **Content Area**: Scrollable, with padding and max-width for readability.
- **Markdown Rendering**: Styled to match www.lgt.com typography and spacing.

## 7. Assumptions and Constraints

- **Assumptions**:
  - Company list API will be provided or a static list will suffice.
  - Report and Summary APIs return valid Markdown text.
  - N8N chatbot supports iframe embedding or API integration.
- **Constraints**:
  - No server-side backend; all logic is client-side.
  - Limited to static hosting (e.g., GitHub Pages, Netlify).
  - APIs may require authentication (details TBD).

## 8. Deliverables

- Angular project structure containing:
  - `app.module.ts`: Root module.
  - Components for header, tabs, and tab content.
  - Services for API calls and state management.
  - Styles matching www.lgt.com.
  - Markdown rendering with `\n` to `\r\n` replacement logic.
- Documentation:
  - README with setup instructions (`ng serve`, `ng build`).
  - Notes on API dependencies and configuration.

## 9. Future Enhancements

- Offline support using Angular's service workers.
- Local storage for recent company selections using `localStorage`.
- Advanced filtering options for company dropdown.
- Real-time updates for ESG data (if API supports).
