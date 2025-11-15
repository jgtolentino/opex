import * as React from 'react'
import { Page } from '@/components/Page'
import styles from '@/components/OpExPortal.module.css'

export default function WorkflowsPage() {
  return (
    <Page>
      <div className={styles.portal}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>n8n Automation Workflows</h1>
          <p className={styles.heroSubtitle}>
            Production-ready workflows for OpEx operations, finance processes, and infrastructure monitoring
          </p>
        </section>

        {/* Workflows Grid */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Available Workflows</h2>
          <div className={styles.cardGrid}>
            {/* Ask OpEx Assistant */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>🤖</div>
              <h3 className={styles.cardTitle}>Ask OpEx / PH Tax Assistant</h3>
              <p className={styles.cardDescription}>
                Webhook-based RAG query handler for Mattermost integration. Use /opex slash command
                to query HR policies, finance workflows, and BIR tax regulations.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--fg-color-4)' }}>
                <strong>Trigger:</strong> Webhook POST<br />
                <strong>Use Cases:</strong> Policy lookups, tax guidance, employee self-service
              </div>
            </div>

            {/* Tax Deadline Notifier */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>⏰</div>
              <h3 className={styles.cardTitle}>PH Tax Deadline Notifier</h3>
              <p className={styles.cardDescription}>
                Automated BIR deadline reminders for multi-agency operations. Daily checks for upcoming
                tax deadlines (1601-C, 2550Q, 1702-RT) with Mattermost notifications.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--fg-color-4)' }}>
                <strong>Trigger:</strong> Cron (Daily 8 AM)<br />
                <strong>Use Cases:</strong> Compliance risk mitigation, deadline tracking
              </div>
            </div>

            {/* Health Check Monitor */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>🏥</div>
              <h3 className={styles.cardTitle}>Service Health Check Monitor</h3>
              <p className={styles.cardDescription}>
                Continuous monitoring of critical infrastructure (MCP, ERP, OCR, n8n). Checks every 10 minutes
                with automatic Mattermost alerts for downtime or performance degradation.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--fg-color-4)' }}>
                <strong>Trigger:</strong> Cron (Every 10 min)<br />
                <strong>Use Cases:</strong> Proactive incident detection, SRE-lite monitoring
              </div>
            </div>

            {/* BIR Document Sync */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>📚</div>
              <h3 className={styles.cardTitle}>BIR Document Sync to RAG</h3>
              <p className={styles.cardDescription}>
                Automatic discovery and ingestion of new BIR documents. Fetches sitemap, downloads PDFs,
                calls embedding-worker to update RAG vector stores.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--fg-color-4)' }}>
                <strong>Trigger:</strong> Cron (Daily 3 AM)<br />
                <strong>Use Cases:</strong> Self-healing knowledge base, zero-manual-effort updates
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Getting Started</h2>
          <div className={styles.processList}>
            <a
              href="https://github.com/jgtolentino/opex/tree/main/workflows/n8n"
              className={styles.processItem}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.processIcon}>📁</div>
              <div className={styles.processContent}>
                <h4 className={styles.processTitle}>Workflow Repository</h4>
                <p className={styles.processDescription}>
                  Browse all workflow JSON files, documentation, and setup guides
                </p>
              </div>
              <span className={styles.processArrow}>→</span>
            </a>

            <a
              href="https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/SETUP.md"
              className={styles.processItem}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.processIcon}>⚙️</div>
              <div className={styles.processContent}>
                <h4 className={styles.processTitle}>Setup Guide</h4>
                <p className={styles.processDescription}>
                  Configure n8n credentials, import workflows, and test integrations
                </p>
              </div>
              <span className={styles.processArrow}>→</span>
            </a>

            <a
              href="https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/MATTERMOST_CONFIG.md"
              className={styles.processItem}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.processIcon}>💬</div>
              <div className={styles.processContent}>
                <h4 className={styles.processTitle}>Mattermost Integration</h4>
                <p className={styles.processDescription}>
                  Set up /opex slash command and configure webhooks
                </p>
              </div>
              <span className={styles.processArrow}>→</span>
            </a>

            <a
              href="https://github.com/jgtolentino/opex/blob/main/workflows/n8n/docs/CREDENTIALS.md"
              className={styles.processItem}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.processIcon}>🔑</div>
              <div className={styles.processContent}>
                <h4 className={styles.processTitle}>Credentials Guide</h4>
                <p className={styles.processDescription}>
                  Configure Supabase, Mattermost, and GitHub credentials in n8n
                </p>
              </div>
              <span className={styles.processArrow}>→</span>
            </a>
          </div>
        </section>

        {/* Quick Start */}
        <section className={styles.section}>
          <div className={styles.actionBanner}>
            <div className={styles.actionContent}>
              <h2 className={styles.actionTitle}>Quick Start</h2>
              <p className={styles.actionDescription}>
                Import workflows into n8n and start automating OpEx operations in minutes
              </p>
            </div>
            <div className={styles.actionButtons}>
              <a
                href="https://ipa.insightpulseai.net"
                className={styles.primaryButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open n8n Instance
              </a>
              <a
                href="https://github.com/jgtolentino/opex/tree/main/workflows/n8n"
                className={styles.secondaryButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Documentation
              </a>
            </div>
          </div>
        </section>
      </div>
    </Page>
  )
}
