import * as React from 'react'
import Link from 'next/link'
import styles from './OpExPortal.module.css'

const DOCS_BASE_URL = 'https://docs-o31ksa8qj-jake-tolentinos-projects-c0369c83.vercel.app'

export function OpExPortal() {
  return (
    <div className={styles.portal}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Operational Excellence Hub</h1>
        <p className={styles.heroSubtitle}>
          Your centralized knowledge base for HR, Finance, and operational workflows
        </p>
      </section>

      {/* Start Here Cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Start Here</h2>
        <div className={styles.cardGrid}>
          <a
            href={`${DOCS_BASE_URL}/docs/hr/overview`}
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.cardIcon}>👥</div>
            <h3 className={styles.cardTitle}>HR Documentation</h3>
            <p className={styles.cardDescription}>
              Employee workflows, policies, and templates for hiring, onboarding, and performance management
            </p>
            <span className={styles.cardCta}>View HR Docs →</span>
          </a>

          <a
            href={`${DOCS_BASE_URL}/docs/finance/overview`}
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.cardIcon}>💰</div>
            <h3 className={styles.cardTitle}>Finance Documentation</h3>
            <p className={styles.cardDescription}>
              Financial processes, approval workflows, and expense management policies
            </p>
            <span className={styles.cardCta}>View Finance Docs →</span>
          </a>

          <a
            href={`${DOCS_BASE_URL}/docs/knowledge-base/introduction`}
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.cardIcon}>📚</div>
            <h3 className={styles.cardTitle}>Knowledge Base</h3>
            <p className={styles.cardDescription}>
              Getting started guides, glossary, FAQs, and general operational knowledge
            </p>
            <span className={styles.cardCta}>View Knowledge Base →</span>
          </a>
        </div>
      </section>

      {/* Key Processes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Key Processes</h2>
        <div className={styles.processList}>
          <a
            href={`${DOCS_BASE_URL}/docs/hr/workflows/employee-requisition`}
            className={styles.processItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.processIcon}>📋</div>
            <div className={styles.processContent}>
              <h4 className={styles.processTitle}>Employee Requisition Workflow</h4>
              <p className={styles.processDescription}>
                Complete BPMN workflow for requesting and approving new employee positions
              </p>
            </div>
            <span className={styles.processArrow}>→</span>
          </a>

          <a
            href={`${DOCS_BASE_URL}/docs/finance/workflows/purchase-request`}
            className={styles.processItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.processIcon}>🛒</div>
            <div className={styles.processContent}>
              <h4 className={styles.processTitle}>Purchase Request Process</h4>
              <p className={styles.processDescription}>
                Procurement workflow with approval matrix and budget validation
              </p>
            </div>
            <span className={styles.processArrow}>→</span>
          </a>

          <a
            href={`${DOCS_BASE_URL}/docs/finance/workflows/expense-reimbursement`}
            className={styles.processItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.processIcon}>💳</div>
            <div className={styles.processContent}>
              <h4 className={styles.processTitle}>Expense Reimbursement</h4>
              <p className={styles.processDescription}>
                Submit and track expense claims with automated approval routing
              </p>
            </div>
            <span className={styles.processArrow}>→</span>
          </a>

          <a
            href={`${DOCS_BASE_URL}/docs/hr/workflows/onboarding`}
            className={styles.processItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.processIcon}>🎯</div>
            <div className={styles.processContent}>
              <h4 className={styles.processTitle}>Employee Onboarding</h4>
              <p className={styles.processDescription}>
                Complete onboarding checklist from offer acceptance to first day
              </p>
            </div>
            <span className={styles.processArrow}>→</span>
          </a>

          <a
            href={`${DOCS_BASE_URL}/docs/hr/workflows/performance-review`}
            className={styles.processItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.processIcon}>📊</div>
            <div className={styles.processContent}>
              <h4 className={styles.processTitle}>Performance Review Cycle</h4>
              <p className={styles.processDescription}>
                Annual and quarterly performance review process and templates
              </p>
            </div>
            <span className={styles.processArrow}>→</span>
          </a>
        </div>
      </section>

      {/* Automation Workflows */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Automation Workflows</h2>
        <div className={styles.processList}>
          <a
            href="https://ipa.insightpulseai.net/workflow"
            className={styles.processItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.processIcon}>🤖</div>
            <div className={styles.processContent}>
              <h4 className={styles.processTitle}>Ask OpEx Assistant (via Mattermost)</h4>
              <p className={styles.processDescription}>
                Use /opex slash command in Mattermost to query HR/Finance policies and BIR tax regulations
              </p>
            </div>
            <span className={styles.processArrow}>→</span>
          </a>

          <a
            href="https://ipa.insightpulseai.net/workflow"
            className={styles.processItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.processIcon}>⏰</div>
            <div className={styles.processContent}>
              <h4 className={styles.processTitle}>Tax Deadline Notifier</h4>
              <p className={styles.processDescription}>
                Automated BIR deadline reminders for 1601-C, 2550Q, and other tax forms across all agencies
              </p>
            </div>
            <span className={styles.processArrow}>→</span>
          </a>

          <a
            href="https://ipa.insightpulseai.net/workflow"
            className={styles.processItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.processIcon}>🏥</div>
            <div className={styles.processContent}>
              <h4 className={styles.processTitle}>Service Health Monitor</h4>
              <p className={styles.processDescription}>
                Continuous monitoring of MCP, ERP, OCR services with automated Mattermost alerts
              </p>
            </div>
            <span className={styles.processArrow}>→</span>
          </a>

          <a
            href="https://ipa.insightpulseai.net/workflow"
            className={styles.processItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.processIcon}>📚</div>
            <div className={styles.processContent}>
              <h4 className={styles.processTitle}>BIR Document Sync</h4>
              <p className={styles.processDescription}>
                Automatic discovery and ingestion of new BIR documents into the RAG knowledge base
              </p>
            </div>
            <span className={styles.processArrow}>→</span>
          </a>
        </div>
      </section>

      {/* Need to Change a Process */}
      <section className={styles.section}>
        <div className={styles.actionBanner}>
          <div className={styles.actionContent}>
            <h2 className={styles.actionTitle}>Need to change a process?</h2>
            <p className={styles.actionDescription}>
              Submit a change request or improvement suggestion for any operational workflow
            </p>
          </div>
          <div className={styles.actionButtons}>
            <a
              href="https://www.notion.so/team/1db87692-d25c-81b3-9ecf-0042625a31df/join"
              className={styles.primaryButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Notion Workspace
            </a>
            <a
              href="https://github.com/jgtolentino/opex/issues/new"
              className={styles.secondaryButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Submit GitHub Issue
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
