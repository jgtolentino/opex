'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './InteractiveProcessFlow.module.css';

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  details: string[];
  tools: string[];
  duration: string;
}

const processSteps: ProcessStep[] = [
  {
    id: 1,
    title: 'Discover',
    description: 'Map your current processes',
    icon: '🔍',
    details: [
      'Process mining from event logs',
      'Stakeholder interviews',
      'System documentation review',
      'Bottleneck identification',
    ],
    tools: ['PM4Py', 'Process Mining', 'Interviews'],
    duration: '2-4 weeks',
  },
  {
    id: 2,
    title: 'Analyze',
    description: 'Identify improvement opportunities',
    icon: '📊',
    details: [
      'Performance metrics analysis',
      'Root cause analysis',
      'Automation opportunity scoring',
      'ROI calculation',
    ],
    tools: ['Apache Superset', 'BPM Analyst Agent', 'Data Analytics'],
    duration: '1-2 weeks',
  },
  {
    id: 3,
    title: 'Design',
    description: 'Create optimized process models',
    icon: '✏️',
    details: [
      'BPMN 2.0 modeling',
      'AI-powered recommendations',
      'Best practice templates',
      'Simulation and validation',
    ],
    tools: ['bpmn.io', 'OpEx RAG', 'BPMN Simulator'],
    duration: '2-3 weeks',
  },
  {
    id: 4,
    title: 'Implement',
    description: 'Deploy automation and changes',
    icon: '🚀',
    details: [
      'Workflow automation setup',
      'System integration',
      'User training',
      'Pilot testing',
    ],
    tools: ['Camunda', 'n8n', 'Odoo Integration'],
    duration: '3-6 weeks',
  },
  {
    id: 5,
    title: 'Monitor',
    description: 'Track performance and improve',
    icon: '📈',
    details: [
      'Real-time dashboards',
      'KPI tracking',
      'Continuous improvement',
      'AI-powered insights',
    ],
    tools: ['Superset Dashboards', 'Process Intelligence', 'RAG Assistants'],
    duration: 'Ongoing',
  },
];

export function InteractiveProcessFlow() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className={styles.flowSection}>
      <div className={styles.container}>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Interactive Process Journey
        </motion.h2>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Click on each step to explore the transformation process
        </motion.p>

        <div className={styles.flowContainer}>
          <div className={styles.timeline}>
            {processSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <motion.div
                  className={`${styles.stepNode} ${
                    activeStep === step.id ? styles.active : ''
                  }`}
                  onClick={() =>
                    setActiveStep(activeStep === step.id ? null : step.id)
                  }
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={styles.stepIcon}>{step.icon}</div>
                  <div className={styles.stepNumber}>{step.id}</div>
                </motion.div>

                {index < processSteps.length - 1 && (
                  <motion.div
                    className={styles.connector}
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeStep && (
              <motion.div
                className={styles.detailsCard}
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                {processSteps
                  .filter((s) => s.id === activeStep)
                  .map((step) => (
                    <div key={step.id} className={styles.detailsContent}>
                      <div className={styles.detailsHeader}>
                        <div className={styles.detailsIcon}>{step.icon}</div>
                        <div>
                          <h3 className={styles.detailsTitle}>{step.title}</h3>
                          <p className={styles.detailsDescription}>
                            {step.description}
                          </p>
                        </div>
                        <div className={styles.duration}>{step.duration}</div>
                      </div>

                      <div className={styles.detailsGrid}>
                        <div className={styles.detailsSection}>
                          <h4 className={styles.sectionTitle}>Key Activities</h4>
                          <ul className={styles.detailsList}>
                            {step.details.map((detail, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                              >
                                {detail}
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        <div className={styles.detailsSection}>
                          <h4 className={styles.sectionTitle}>Tools & Methods</h4>
                          <div className={styles.toolsGrid}>
                            {step.tools.map((tool, idx) => (
                              <motion.div
                                key={idx}
                                className={styles.toolBadge}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                              >
                                {tool}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!activeStep && (
            <motion.div
              className={styles.promptCard}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p>👆 Click on any step to see details</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
