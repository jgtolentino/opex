# Notion Month-End Closing Update Guide

This guide explains how to update your Notion database with November 2025 month-end closing tasks.

## 📋 Overview

The script `update-notion-month-end.js` updates your existing October 2025 month-end closing page to November 2025 and adds November-specific tasks.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd packages/mattermost-rag/scripts
npm install
```

### 2. Set Up Notion Integration

1. **Create a Notion Integration**:
   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Click "New integration"
   - Name it "OpEx Month-End Updater"
   - Select the workspace where your database is located
   - Copy the "Internal Integration Token"

2. **Share the Database with Integration**:
   - Open your Notion database
   - Click "Share" in the top right
   - Invite your integration by name
   - Grant "Can edit" permissions

### 3. Set Environment Variable

```bash
export NOTION_API_KEY=your_integration_token_here
```

Or add to your `.env` file:
```bash
NOTION_API_KEY=your_integration_token_here
```

## 🔧 Usage

### Update to November 2025

```bash
# Using npm script
npm run update

# Or directly with node
NOTION_API_KEY=your_token node update-notion-month-end.js update
```

### Get Page Information

```bash
# Check current page status
npm run info

# Or directly
NOTION_API_KEY=your_token node update-notion-month-end.js info
```

## 📝 What the Script Does

### 1. Updates Page Properties
- **Title**: Changes from "Month-End Closing Tasks - October 2025" to "Month-End Closing Tasks - November 2025"
- **Month**: Updates to "November" (if property exists)
- **Year**: Updates to 2025 (if property exists)
- **Status**: Sets to "In Progress" (if property exists)

### 2. Adds November-Specific Tasks
The script adds these November 2025 specific tasks as to-do items:

- Review and process November expense reports
- Update depreciation schedules for November
- Process November accruals and reversals
- Complete November VAT reconciliation
- Prepare November BIR 2550Q filing
- Update November financial statements
- Review November bank reconciliations
- Process November payroll adjustments
- Update November fixed asset register

## 🔍 Verification

After running the script:

1. **Check the page URL** printed in the console
2. **Verify the title** has been updated to November 2025
3. **Confirm new tasks** are added under "November 2025 Specific Tasks"
4. **Test the page** by checking off some tasks

## 🛠️ Manual Alternative

If you prefer to update manually:

1. **Open the October 2025 page**: [Month-End Closing Tasks - October 2025](https://www.notion.so/Month-End-Closing-Tasks-October-2025-7bf32e6a056948f687f55bdff1dd0931)

2. **Update the title** to "Month-End Closing Tasks - November 2025"

3. **Add November-specific tasks** using the template above

## 🔄 Automation

You can integrate this script into your automation workflow:

### Monthly Automation
```bash
# Add to cron for monthly execution (1st of each month)
0 0 1 * * cd /path/to/packages/mattermost-rag/scripts && NOTION_API_KEY=your_token node update-notion-month-end.js update
```

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: Update Notion Month-End
on:
  schedule:
    - cron: '0 0 1 * *'  # First day of every month
  workflow_dispatch:      # Manual trigger

jobs:
  update-notion:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd packages/mattermost-rag/scripts && npm install
      - name: Update Notion
        run: cd packages/mattermost-rag/scripts && node update-notion-month-end.js update
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
```

## 🚨 Troubleshooting

### Common Issues

**"Invalid API token" error:**
- Verify your integration token is correct
- Ensure the integration is shared with the database

**"Could not find page" error:**
- Check the page ID is correct
- Verify the integration has access to the page

**"Rate limited" error:**
- Wait a few minutes and try again
- Notion has rate limits for API calls

**Tasks not appearing:**
- Check the page structure in Notion
- Verify the script has permission to add blocks

### Debug Mode

For detailed debugging, you can modify the script to log more information:

```javascript
// Add to the script for debugging
console.log('Page properties:', page.properties);
console.log('Response:', response);
```

## 📚 Next Steps

1. **Test the script** with your actual Notion setup
2. **Customize the tasks** based on your specific November requirements
3. **Set up automation** for future months
4. **Integrate with your RAG system** to make the tasks queryable

## 🔗 Related Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Notion Integrations Guide](https://developers.notion.com/docs/create-a-notion-integration)
- [Month-End Closing SOP](https://www.notion.so/Month-End-Closing-Tasks-October-2025-7bf32e6a056948f687f55bdff1dd0931)
