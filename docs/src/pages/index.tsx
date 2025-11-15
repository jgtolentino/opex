import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import QuickLinks from '@site/src/components/QuickLinks';
import AIAssistantPlaceholder from '@site/src/components/AIAssistantPlaceholder';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Operational Excellence Starts Here.
        </Heading>
        <p className="hero__subtitle">
          Your unified source of truth for processes, standards, and continuous improvement across the organization.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/knowledge-base/introduction">
            📘 Start With the OpEx Onboarding Path
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/knowledge-base/introduction"
            style={{marginLeft: '1rem'}}>
            🔍 Search SOPs, Policies & Playbooks
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Operational Excellence Platform"
      description="Your unified source of truth for processes, standards, and continuous improvement across the organization.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <QuickLinks />
        <AIAssistantPlaceholder />
      </main>
    </Layout>
  );
}
