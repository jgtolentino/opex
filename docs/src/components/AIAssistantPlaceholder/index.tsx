import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const exampleQuestions = [
  '"How do I request vendor onboarding?"',
  '"What is the approval chain for CapEx?"',
  '"Show me the latest SOP for billing."',
];

export default function AIAssistantPlaceholder(): ReactNode {
  return (
    <section className={styles.aiAssistant}>
      <div className="container">
        <div className={styles.aiAssistantContent}>
          <div className={styles.aiAssistantBadge}>Coming Soon</div>
          <Heading as="h2" className={styles.aiAssistantTitle}>
            AI Assistant
          </Heading>
          <p className={styles.aiAssistantDescription}>
            Ask questions and get instant answers from your operational documentation:
          </p>
          <div className={styles.exampleQuestions}>
            {exampleQuestions.map((question, idx) => (
              <div key={idx} className={styles.exampleQuestion}>
                <span className={styles.questionIcon}>💬</span>
                <span className={styles.questionText}>{question}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
