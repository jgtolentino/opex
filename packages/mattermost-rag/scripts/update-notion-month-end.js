// Script to update Notion database with November 2025 month-end closing tasks
// This script updates the existing October 2025 page to November 2025

const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// The page ID from your current month-end page
const CURRENT_PAGE_ID = '8b1b3f0532ab45c6a7475ad04ff67979';

async function updateMonthEndPage() {
  try {
    console.log('Updating Notion month-end closing page...');

    // Update the page title and properties for November 2025
    const response = await notion.pages.update({
      page_id: CURRENT_PAGE_ID,
      properties: {
        // Update the title to November 2025
        'Name': {
          title: [
            {
              text: {
                content: 'Month-End Closing Tasks - November 2025'
              }
            }
          ]
        },
        // Update the month property if it exists
        'Month': {
          select: {
            name: 'November'
          }
        },
        // Update the year property if it exists
        'Year': {
          number: 2025
        },
        // Update status to reflect current month
        'Status': {
          status: {
            name: 'In Progress'
          }
        }
      }
    });

    console.log('✅ Successfully updated Notion page to November 2025');
    console.log(`📄 Page URL: ${response.url}`);

    // Now let's add some November-specific tasks
    await addNovemberTasks(response.id);

  } catch (error) {
    console.error('❌ Error updating Notion page:', error);
  }
}

async function addNovemberTasks(pageId) {
  try {
    console.log('Adding November-specific tasks...');

    // November-specific closing tasks (following October pattern with December 3rd final sign-off)
    const novemberTasks = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'November 2025 Specific Tasks' } }]
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Review and process November expense reports (Due: Nov 24-27)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Update depreciation schedules for November (Due: Nov 28-29)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Process November accruals and reversals (Due: Nov 27-29)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Complete November VAT reconciliation (Due: Nov 24-28)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Prepare November BIR 2550Q filing (Due: Nov 28-29)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Update November financial statements (Due: Nov 30-Dec 3)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Review November bank reconciliations (Due: Nov 30-Dec 3)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Process November payroll adjustments (Due: Nov 27-29)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Update November fixed asset register (Due: Nov 28-29)' } }],
          checked: false
        }
      },
      {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: [{ type: 'text', text: { content: 'Final TB Sign-off & Filing (Due: Dec 3, 2025)' } }],
          checked: false
        }
      }
    ];

    // Append the November tasks to the page
    for (const block of novemberTasks) {
      await notion.blocks.children.append({
        block_id: pageId,
        children: [block]
      });
    }

    console.log('✅ Successfully added November-specific tasks');

  } catch (error) {
    console.error('❌ Error adding November tasks:', error);
  }
}

// CLI usage
async function main() {
  const command = process.argv[2];

  if (!process.env.NOTION_API_KEY) {
    console.error('❌ NOTION_API_KEY environment variable is required');
    console.log('Usage: NOTION_API_KEY=your_token node update-notion-month-end.js [update|info]');
    process.exit(1);
  }

  switch (command) {
    case 'update':
      await updateMonthEndPage();
      break;
    case 'info':
      await getPageInfo();
      break;
    default:
      console.log('Usage: node update-notion-month-end.js [update|info]');
      console.log('  update - Update October page to November and add tasks');
      console.log('  info   - Get information about the current page');
      break;
  }
}

async function getPageInfo() {
  try {
    const page = await notion.pages.retrieve({
      page_id: CURRENT_PAGE_ID
    });

    console.log('📄 Page Information:');
    console.log('Title:', page.properties.Name?.title?.[0]?.plain_text || 'N/A');
    console.log('URL:', page.url);
    console.log('Last Edited:', page.last_edited_time);

  } catch (error) {
    console.error('❌ Error getting page info:', error);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateMonthEndPage, addNovemberTasks };
