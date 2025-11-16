# SAP Design System for Web - Comprehensive Research Report

**Research Date**: November 16, 2025
**Focus**: SAP Fiori for Web Design System
**Status**: Complete

---

## Executive Summary

The SAP Design System for Web (SAP Fiori) is a comprehensive, enterprise-grade design system that provides a modular, multi-technology approach to building web applications. It features centrally defined components that can be used by products and extended to fit specific needs, with a strong emphasis on accessibility, responsive design, and framework-agnostic implementation.

**Current Version**: 1.139 (as of November 2025)
**Latest UI Kit**: SAP Fiori for Web UI Kit v6.0

---

## 1. Design System Architecture

### 1.1 Core Philosophy

The SAP Design System is built on a **modular and multi-technology approach** where:
- Components are centrally defined
- Can be extended or modified for specific needs
- Work across web, iOS, Android, and conversational UIs
- Support both design and development workflows

### 1.2 Technology Stack

```
SAP Design System
├── SAPUI5 Framework (MVC Architecture)
├── UI5 Web Components (Framework-Agnostic)
├── SAP Fiori Elements (Metadata-Driven)
└── Design Tokens (Theming System)
```

**Key Technologies**:
- **SAPUI5**: Client-side JavaScript framework based on MVC architecture using jQuery
- **UI5 Web Components**: Lightweight, reusable custom HTML elements based on web standards
- **SAP Fiori Elements**: Metadata-driven UI generation using OData annotations
- **Design Tokens**: Central theming system with Figma integration

---

## 2. Five Core Design Principles

SAP Fiori's design philosophy is anchored in **five fundamental principles**:

### 2.1 Role-Based
- Users see only the apps and features they need for their specific role
- Tailored to organizational roles for maximum relevance
- Reduces cognitive load by showing contextually appropriate content

### 2.2 Adaptive
- Seamless functionality across devices and contexts
- Responsive framework adjusts to screen sizes, resolutions, and orientations
- Works on desktop, tablet, and mobile devices
- Context-aware interfaces

### 2.3 Simple
- Focus on essential tasks and information
- Streamlined user journeys
- Minimal cognitive effort required
- Clear visual hierarchy

### 2.4 Coherent
- Consistent interactions across all SAP applications
- Common tasks have uniform visual design
- Users can quickly grasp operation of diverse applications
- Unified experience throughout SAP ecosystem

### 2.5 Delightful
- Engaging and enjoyable user experience
- Thoughtful animations and interactions
- Aesthetic appeal without compromising functionality

---

## 3. SAPUI5 Framework

### 3.1 Architecture

**Model-View-Controller (MVC) Pattern**:
```
┌─────────────────────────────────────┐
│         SAPUI5 Application          │
├─────────────────────────────────────┤
│  Models (Data Layer)                │
│  - OData models                     │
│  - JSON models                      │
│  - XML models                       │
├─────────────────────────────────────┤
│  Views (Presentation Layer)         │
│  - XML views (recommended)          │
│  - JavaScript views                 │
│  - HTML views                       │
├─────────────────────────────────────┤
│  Controllers (Logic Layer)          │
│  - Event handlers                   │
│  - Data binding                     │
│  - Navigation logic                 │
└─────────────────────────────────────┘
```

**Core Components**:
- JavaScript framework built on jQuery
- Extension libraries for specialized functionality
- Pre-built controls and themes
- Data binding capabilities
- Routing and navigation

### 3.2 SAPUI5 vs SAP Fiori

| Aspect | SAPUI5 | SAP Fiori |
|--------|--------|-----------|
| **Nature** | Programming framework | User experience guideline |
| **Purpose** | Build web applications | Design standards for applications |
| **Role** | Technical implementation | UX design principles |
| **Relationship** | Implementation tool | Design specification |

**Key Insight**: SAPUI5 is the framework used to build applications that follow SAP Fiori design guidelines.

---

## 4. UI5 Web Components

### 4.1 Framework-Agnostic Architecture

UI5 Web Components are **"enterprise-flavored sugar on top of native APIs"** that enable building SAP Fiori interfaces with any technology.

**Key Characteristics**:
- Built on Web Components standard (Custom Elements, Shadow DOM, HTML Templates)
- Framework-agnostic: works with React, Angular, Vue, Svelte, vanilla JS
- Lightweight and reusable
- Hide implementation complexity behind single HTML tags
- Compatible with any version of any framework

### 4.2 Component Categories

**Core Components** (bread-and-butter):
- Buttons
- Input fields
- Dialogs and popups
- Tables
- Pickers
- Form controls

**Fiori-Specific Components**:
- Shell Bar
- Side Navigation
- Fiori-specific patterns

### 4.3 Usage Example

```html
<!-- Framework-agnostic usage -->
<ui5-button design="Emphasized">Submit</ui5-button>
<ui5-input placeholder="Enter text"></ui5-input>
<ui5-table></ui5-table>
```

**Official Resources**:
- GitHub: https://github.com/UI5/webcomponents
- Documentation: https://ui5.github.io/webcomponents/
- NPM: `@ui5/webcomponents`

---

## 5. SAP Fiori Elements

### 5.1 Metadata-Driven Development

SAP Fiori Elements represents a **paradigm shift** from extensive UI coding to declarative, metadata-driven development.

**Architecture**:
```
OData Service + Annotations + Floorplan Template
              ↓
    SAP Fiori Elements Runtime
              ↓
    Fully Functional UI (Auto-Generated)
```

### 5.2 Core Building Blocks

1. **OData Services**: Backend data sources
2. **OData Annotations**: Semantic metadata describing entities and properties
3. **Floorplan Templates**: Predefined page layouts

### 5.3 Smart Controls

**Definition**: Controls that interpret OData metadata and adapt behavior automatically.

**Capabilities**:
- Interpret OData protocol
- Adapt based on annotations
- Determine appropriate control instantiation
- Render content based on metadata
- Dynamic field control

**Examples**:
- Smart Table
- Smart Form
- Smart Filter Bar
- Smart Chart

### 5.4 Benefits

- **Reduced Development Time**: Minimal custom coding
- **Consistency**: Automatic adherence to Fiori guidelines
- **Maintainability**: Changes via annotations vs. code
- **Standardization**: Uniform UX across applications

---

## 6. Floorplans and Page Layouts

### 6.1 What Are Floorplans?

**Floorplans** represent different layout types for whole pages, defining the structure of controls and handling of use cases.

### 6.2 Key Floorplan Types

#### **List Report**
- **Purpose**: View and work with large sets of items
- **Features**:
  - Powerful filtering and search
  - Mass actions
  - Quick navigation to details
- **Use Cases**: Transaction lists, item browsers

#### **Object Page**
- **Purpose**: Display, create, or edit an object
- **Features**:
  - Hierarchical information display
  - Sections and subsections
  - Header with key info
  - Action buttons
- **Use Cases**: Master data, transaction details
- **Status**: Recommended for both simple and complex objects

#### **Analytical List Page**
- **Purpose**: Combine analytical insights with transactional data
- **Features**:
  - Dynamic data visualization
  - Charts and lists combined
  - Drill-down capabilities
  - Step-by-step analysis
  - Root cause investigation
- **Use Cases**: Business intelligence, data analysis

#### **Overview Page**
- **Purpose**: Dashboard-style overview
- **Features**: Card-based layout, KPIs, quick access

#### **Worklist**
- **Purpose**: Task-focused work processing
- **Features**: Action-oriented, streamlined workflow

### 6.3 Layout Flexibility

- **Single Floorplan**: Full-screen page with one layout
- **Flexible Column Layout**: 2-3 floorplans side-by-side
- **Freestyle vs. Elements**: Build with Fiori Elements or from scratch

---

## 7. Design Tokens and Theming

### 7.1 Horizon Theme Family

**Current Design Language**: Horizon

**Available Themes**:
1. **Morning Horizon** - Light theme for daytime use
2. **Evening Horizon** - Dark theme for low-light environments
3. **High-Contrast Black** - Accessibility theme
4. **High-Contrast White** - Accessibility theme

### 7.2 Design Token System

**Definition**: Named entities that store visual design attributes in a centralized repository.

**Token Types**:

#### Reference Tokens
- Contain primary and secondary colors
- Define theme essence
- Different in each theme
- **Not used directly** in CSS

#### Component Tokens
- Represent component parts at atomic level
- Used to theme SAP UI components
- **Stable names** across themes
- Aligned with CSS variables
- **Use these in implementation**

### 7.3 Token Categories

- **Color Tokens**: Palette definitions
- **Typography Tokens**: Font families, sizes, weights
- **Shadow Tokens**: Elevation and depth
- **Metrics Tokens**: Spacing, sizing, layout

### 7.4 Benefits

- Replace hard-coded values with semantic names
- Maintain alignment and consistency
- Streamline building, maintaining, and scaling
- 1:1 mapping between Figma and implementation
- Central repository for all platforms

### 7.5 Implementation

```css
/* Instead of hard-coded values */
background-color: #0854A0; /* ❌ Don't do this */

/* Use component tokens */
background-color: var(--sapButton_Emphasized_Background); /* ✅ Do this */
```

---

## 8. Figma UI Kits

### 8.1 Available Kits

#### SAP Fiori for Web UI Kit v6.0
- **Content**: Common components, patterns, fundamental elements
- **Includes**: Colors, typography, spacing, grid system
- **Location**: Figma Community
- **Purpose**: Accelerate design and encourage consistency

#### SAP S/4HANA Web UI Kit
- **Content**: Components, floorplans, foundations, layouts
- **Devices**: Non-touch (Compact) and touch (Cozy) modes
- **Purpose**: Fiori for Web interfaces for S/4HANA

#### SAP Digital Design System Kit
- **Content**: Web components, patterns, floorplans
- **Features**: Full theming capabilities (Morning, Evening, High-Contrast)
- **Version**: v2.0
- **Access**: Search in Figma Assets panel

### 8.2 Integration with Design Tokens

- Design tokens are basis for Horizon-themed Figma libraries
- Available as Figma assets
- Linked directly to implementation
- Token names match 1:1 with CSS variables
- Supports Figma Variables and Design Tokens

---

## 9. Accessibility

### 9.1 Compliance Standards

- **WCAG 2.2**: Full compliance with Web Content Accessibility Guidelines
- **WAI-ARIA**: Screen reader support based on ARIA standard
- **Section 508**: US federal accessibility requirements

### 9.2 Color Contrast

- **Default Theme**: Meets minimum contrast requirements
- **High-Contrast Themes**: 7:1 contrast ratio for text
- **Options**: Black and White variants

### 9.3 Screen Reader Support

**Implementation Based on Four Principles**:

1. **Exploring**: Navigate and discover content
2. **Operating**: Interact with controls
3. **Notifications**: Receive feedback on actions
4. **Prerequisites**: Ensure proper setup

**Technical Implementation**:
- ARIA roles on all SAPUI5 controls
- Visible and invisible textual information
- Structural information for navigation
- Speech and braille output support

**Supported Platforms**:
- Windows desktop
- macOS desktop
- Majority of UI5 controls included

### 9.4 Keyboard Navigation

**Features**:
- Predefined tab order sequence
- Floorplan-level tab order
- Application access sequence
- Within-application navigation
- **F6/Shift+F6**: Skip between groups
- Direct keyboard navigation to logical groups

**Testing Order**:
1. Test keyboard navigation first
2. Then test screen reader (requires working keyboard nav)

---

## 10. Development Workflow

### 10.1 UI5 Tooling

**Description**: Open and modular toolchain for state-of-the-art UI5 development.

**Key Features**:
- Node.js-based CLI
- Local hosting of SAPUI5 runtime
- Fast UI5 library loading
- Proxy for backend OData services
- CORS bypass support
- Currently at version 2.x

**Benefits**:
- No need to disable browser security
- Fast local development
- Live reloading
- Watch mode for file changes
- JSHint linting
- Built-in testing support

### 10.2 Yeoman Generators

#### Official SAP Fiori Generator
- **Package**: `@sap/generator-fiori`
- **Integration**: SAP Fiori Tools extension pack
- **IDE Support**: VS Code, SAP Business Application Studio
- **Access**: CMD/Ctrl + Shift + P → "Fiori: Open Application Generator"

#### Easy-UI5 Generator
- **Purpose**: Rapid prototyping
- **GitHub**: SAP/generator-easy-ui5
- **Features**: Quick scaffolding, basic setup, template-based

**Workflow**:
```bash
# Install generator
npm install -g @sap/generator-fiori

# Create new app
yo @sap/fiori

# Start development
ui5 serve

# Build for production
ui5 build
```

### 10.3 IDE Support

**Primary IDEs**:
1. **SAP Business Application Studio** (Cloud-based)
2. **Visual Studio Code** (Local development)

**Extensions**:
- SAP Fiori Tools extension pack
- UI5 language support
- Template wizards
- Testing tools

---

## 11. Component Library

### 11.1 Component Count

**Current Status**: 75+ components in the latest guidelines

### 11.2 Component Categories

#### Input & Forms
- Input fields
- Text areas
- Select dropdowns
- Date pickers
- Time pickers
- Checkboxes
- Radio buttons
- Switches

#### Navigation
- Shell Bar
- Side Navigation
- Breadcrumbs
- Tabs
- Pagination

#### Data Display
- Tables
- Lists
- Cards
- Charts
- Trees
- Timelines

#### Feedback & Dialogs
- Dialogs
- Popovers
- Message strips
- Busy indicators
- Progress indicators
- Notifications

#### Buttons & Actions
- Buttons (various types)
- Menu buttons
- Split buttons
- Icon buttons
- Segmented buttons

#### Layout
- Grid system
- Panels
- Toolbars
- Headers
- Footers

---

## 12. Visual Design Foundations

### 12.1 Core Elements

**Typography**:
- SAP-specific font families
- Defined type scales
- Semantic typography tokens
- Responsive text sizing

**Color System**:
- Semantic color palette
- State colors (success, error, warning, information)
- Brand colors
- Neutral colors
- Background and surface colors

**Spacing & Grid**:
- Consistent spacing scale
- 12-column responsive grid
- Compact and Cozy density modes
- Baseline grid

**Iconography**:
- SAP Icon Font
- Consistent icon set
- Multiple sizes
- Semantic usage

### 12.2 Density Modes

**Compact Mode**:
- Desktop/laptop use
- Mouse and keyboard interaction
- Denser layouts
- Smaller touch targets

**Cozy Mode**:
- Tablet and touch devices
- Touch-optimized
- Larger touch targets (44x44px minimum)
- More spacing

---

## 13. Documentation Structure

### 13.1 Main Sections

1. **Foundations**
   - Design principles
   - Visual language
   - Theming
   - Accessibility

2. **UI Elements**
   - Components
   - Patterns
   - Usage guidelines
   - Code examples

3. **Page Types**
   - Floorplans
   - Layouts
   - Templates

4. **Technologies**
   - SAPUI5
   - UI5 Web Components
   - Fiori Elements
   - SDKs and toolkits

### 13.2 Official Resources

**Primary Documentation**:
- https://www.sap.com/design-system/fiori-design-web/
- https://experience.sap.com/fiori-design-web/

**GitHub Repositories**:
- https://github.com/UI5/webcomponents
- https://github.com/SAP/generator-easy-ui5
- https://github.com/SAP/openui5

**NPM Packages**:
- `@ui5/webcomponents`
- `@sap/generator-fiori`

**Figma Resources**:
- SAP Fiori for Web UI Kit (Figma Community)
- SAP S/4HANA Web UI Kit
- SAP Digital Design System Kit v2.0

---

## 14. Updates and Releases

### 14.1 Release Cadence

- **Quarterly UX Updates**: Community blog posts and webinars
- **Latest Guideline Version**: 1.139 (as of November 2025)
- **UI Kit Version**: 6.0 (latest major release)

### 14.2 What's New (2025)

**Recent Enhancements**:
- New SAP Design System portal (single source for design and development)
- Upgraded UI Kit to version 6.0
- Enhanced Figma integration
- Improved design token system
- Expanded component library

### 14.3 Staying Updated

**Resources**:
- Quarterly webinars
- SAP Community blog posts
- Release notes on design system portal
- Figma Community updates

---

## 15. Community and Support

### 15.1 Official Channels

**SAP Community**:
- Blog posts by SAP and community members
- Discussion forums
- Technical Q&A

**GitHub**:
- Issue tracking
- Feature requests
- Contribution guidelines

**Figma Community**:
- UI Kit downloads
- Template sharing
- Design discussions

### 15.2 Learning Resources

**SAP Design System Academy**:
- SAP Design System Essentials (Module 1)
- Foundation courses
- Component usage tutorials
- Best practices

**SAP Learning**:
- Introduction to SAP Fiori
- SAPUI5 development courses
- Fiori Elements training

---

## 16. Integration Opportunities for OpEx

### 16.1 Relevant Components for Finance SSC

**Data Display**:
- **Tables**: Transaction lists, reconciliations
- **Cards**: KPI displays, dashboards
- **Charts**: Financial analytics

**Forms**:
- **Smart Forms**: BIR form inputs
- **Input Validation**: Tax calculations
- **Date Pickers**: Deadline management

**Floorplans**:
- **List Report**: Transaction processing
- **Analytical List Page**: Financial reporting
- **Object Page**: Transaction details

### 16.2 Theming Considerations

**Recommended Approach**:
- Use **design tokens** for customization
- Support both Morning and Evening Horizon
- Implement high-contrast themes for accessibility
- Leverage Figma UI Kit for design consistency

### 16.3 Technology Recommendations

**For OpEx Platform**:

1. **UI5 Web Components** (Recommended)
   - Framework-agnostic (works with Next.js/React)
   - Enterprise-grade
   - Full Fiori compliance
   - Accessibility built-in

2. **Design Token Integration**
   - Align with SAP's token system
   - Use for custom components
   - Maintain consistency with Fiori apps

3. **Figma Workflow**
   - Download SAP Fiori for Web UI Kit
   - Design in Figma using official components
   - Export design tokens
   - Implement with UI5 Web Components

### 16.4 Implementation Strategy

**Phase 1: Foundation**
- Install UI5 Web Components
- Set up design token system
- Implement Horizon theming

**Phase 2: Component Migration**
- Identify existing components
- Map to SAP Fiori equivalents
- Gradual replacement

**Phase 3: Floorplan Adoption**
- Implement List Report for transaction lists
- Use Object Page for transaction details
- Add Analytical List Page for reporting

---

## 17. Key Takeaways

### 17.1 Design System Strengths

✅ **Enterprise-Grade**: Battle-tested in SAP's global ecosystem
✅ **Accessibility First**: WCAG 2.2 compliant, strong screen reader support
✅ **Framework-Agnostic**: UI5 Web Components work with any framework
✅ **Metadata-Driven**: Fiori Elements reduces development time significantly
✅ **Consistent UX**: Coherent experience across all applications
✅ **Well-Documented**: Comprehensive guidelines and resources
✅ **Active Community**: Strong support and regular updates

### 17.2 Considerations

⚠️ **Learning Curve**: Comprehensive system requires time to master
⚠️ **SAP Ecosystem**: Optimized for SAP backends (OData)
⚠️ **Customization**: Some flexibility trade-offs for consistency
⚠️ **Bundle Size**: Full component library can be large (use tree-shaking)

### 17.3 Best Practices

1. **Start with Design Tokens**: Build on the theming foundation
2. **Use Figma UI Kits**: Design before development
3. **Leverage Fiori Elements**: Where metadata-driven approach fits
4. **Follow Accessibility Guidelines**: Non-negotiable for enterprise apps
5. **Adopt Standard Floorplans**: Don't reinvent common patterns
6. **Use UI5 Tooling**: Modern development workflow
7. **Contribute to Community**: Share learnings and solutions

---

## 18. Comparison: SAP Fiori vs Other Design Systems

### 18.1 vs Material Design

| Aspect | SAP Fiori | Material Design |
|--------|-----------|-----------------|
| **Focus** | Enterprise business apps | Consumer + enterprise |
| **Complexity** | High-density data | Varied use cases |
| **Accessibility** | Enterprise-grade | Good, improving |
| **Backend Integration** | Deep OData integration | Backend-agnostic |
| **Metadata-Driven** | Yes (Fiori Elements) | No |

### 18.2 vs Ant Design

| Aspect | SAP Fiori | Ant Design |
|--------|-----------|------------|
| **Origin** | SAP (German) | Alibaba (Chinese) |
| **Enterprise Focus** | Very high | High |
| **Data Visualization** | Strong (smart controls) | Strong (charts) |
| **Form Handling** | Metadata-driven | Code-driven |
| **Global Adoption** | SAP ecosystem | Broader |

### 18.3 Unique Differentiators

**SAP Fiori's Unique Strengths**:
1. **Metadata-Driven Development**: Fiori Elements
2. **Smart Controls**: OData annotation interpretation
3. **Role-Based Design**: Built-in from ground up
4. **Floorplan Templates**: Pre-built page patterns
5. **Enterprise Accessibility**: WCAG 2.2 + extensive screen reader support
6. **Cross-Platform Consistency**: Web, iOS, Android, conversational UI

---

## 19. Future Roadmap Insights

### 19.1 Trends (Based on 2024-2025 Updates)

- **Enhanced AI Integration**: Smart assistance in forms and workflows
- **Improved Developer Experience**: Better tooling and CLI
- **Design Token Expansion**: More granular theming control
- **Performance Optimization**: Smaller bundle sizes, faster rendering
- **Mobile-First Enhancements**: Better touch experiences
- **Accessibility Improvements**: Beyond WCAG 2.2

### 19.2 Community Feedback Themes

- More flexible customization options
- Better documentation for complex scenarios
- Improved TypeScript support
- Enhanced testing utilities
- Faster release cycles

---

## 20. Conclusion

The **SAP Design System for Web** (SAP Fiori) is a mature, comprehensive design system specifically built for enterprise business applications. Its strengths lie in:

- **Enterprise-grade accessibility** and internationalization
- **Metadata-driven development** reducing code complexity
- **Framework-agnostic components** (UI5 Web Components)
- **Consistent UX** across complex business workflows
- **Deep backend integration** with OData services
- **Well-maintained** with regular updates and strong community

For the **OpEx platform**, SAP Fiori provides an excellent foundation for building finance and HR interfaces that require:
- Complex data tables and forms
- Role-based access patterns
- Accessibility compliance
- Consistent enterprise UX
- Integration with business data sources

**Recommendation**: Consider adopting UI5 Web Components selectively for key financial workflows while maintaining the current Next.js architecture. Use SAP's design token system to ensure visual consistency even in custom components.

---

## Appendix A: Quick Reference Links

### Official Documentation
- Main Portal: https://www.sap.com/design-system/fiori-design-web/
- Design Guidelines: https://experience.sap.com/fiori-design-web/
- UI5 Web Components: https://ui5.github.io/webcomponents/

### GitHub Repositories
- UI5 Web Components: https://github.com/UI5/webcomponents
- Easy-UI5 Generator: https://github.com/SAP/generator-easy-ui5

### Figma Resources
- Search "SAP Fiori for Web UI Kit" in Figma Community
- SAP Profile: https://www.figma.com/@sap

### Learning Resources
- SAP Learning: https://learning.sap.com
- SAP Community: https://community.sap.com

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Floorplan** | Predefined page layout template (List Report, Object Page, etc.) |
| **Smart Control** | UI control that interprets OData metadata to adapt behavior |
| **Design Token** | Named entity storing visual design attributes centrally |
| **OData** | Open Data Protocol for RESTful APIs |
| **Annotation** | Metadata describing OData entities and properties |
| **Horizon** | Current SAP design language (successor to Quartz) |
| **Compact** | Desktop density mode with smaller touch targets |
| **Cozy** | Touch-optimized density mode with larger targets |
| **MVC** | Model-View-Controller architecture pattern |
| **WAI-ARIA** | Web Accessibility Initiative - Accessible Rich Internet Applications |
| **WCAG** | Web Content Accessibility Guidelines |

---

**Document Version**: 1.0
**Last Updated**: November 16, 2025
**Researcher**: Claude (Anthropic)
**For**: OpEx Platform - Finance SSC

---

**Next Steps**:
1. Review findings with development team
2. Evaluate UI5 Web Components for pilot implementation
3. Download Figma UI Kit and create design prototypes
4. Plan phased adoption strategy
5. Set up development environment with UI5 Tooling
