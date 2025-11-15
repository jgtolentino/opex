# Diagram Source Files

This directory contains source `.drawio` files for all BPMN, flowcharts, and architectural diagrams used in the documentation.

## Workflow

### 1. Creating/Editing Diagrams

**Tools**:
- **Draw.io Desktop**: https://www.drawio.com/
- **VS Code Extension**: Draw.io Integration
- **Web Version**: https://app.diagrams.net/

**Process**:
1. Create or edit `.drawio` files in this directory
2. Organize by department (hr/, finance/, operations/, technical/)
3. Use descriptive filenames (e.g., `employee-requisition.drawio`)
4. Save and commit to Git

### 2. Automated Export

Diagrams are automatically exported via GitHub Actions:

**Trigger**: Commits modifying `.drawio` files in `docs/diagrams-src/`

**Output**: `docs/static/diagrams/` (SVG + PNG formats)

**Workflow**: `.github/workflows/export-diagrams.yml`

### 3. Using Diagrams in Documentation

**In Markdown**:
```markdown
![Employee Requisition Process](/diagrams/hr/employee-requisition.svg)
```

## Directory Structure

```
diagrams-src/
├── hr/
│   ├── employee-requisition.drawio
│   ├── onboarding-flow.drawio
│   └── performance-review.drawio
├── finance/
│   ├── purchase-request.drawio
│   ├── expense-approval.drawio
│   └── invoice-processing.drawio
└── operations/
    ├── incident-response.drawio
    └── ticket-escalation.drawio
```

## BPMN Best Practices

### Naming Conventions
- Lowercase with hyphens: `employee-requisition.drawio`
- Match documentation page names
- Avoid abbreviations

### BPMN 2.0 Standards
- Use Pool for process boundary
- Swimlanes for actors/departments
- Start events: Green
- End events: Red
- Tasks: Blue
- Gateways: Yellow

### Version Control
- Commit source `.drawio` files to Git
- Don't manually commit exports (automated)
- Descriptive commit messages
- Branches for major redesigns

## Troubleshooting

### Diagrams Not Exporting
Check GitHub Actions: https://github.com/jgtolentino/opex/actions

### Broken Links
- Verify path: `/diagrams/[category]/[filename].svg`
- Check file exists in `docs/static/diagrams/`
- Filename case-sensitive

## Resources

- [BPMN 2.0 Spec](https://www.omg.org/spec/BPMN/2.0/)
- [Draw.io BPMN Guide](https://drawio-app.com/bpmn/)
- [Docusaurus Assets](https://docusaurus.io/docs/static-assets)
