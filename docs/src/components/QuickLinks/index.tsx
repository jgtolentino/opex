import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type QuickLinkItem = {
  title: string;
  icon: string;
  to: string;
};

const QuickLinkList: QuickLinkItem[] = [
  {
    title: 'SOP Library',
    icon: '📄',
    to: '/docs/knowledge-base/introduction',
  },
  {
    title: 'Process Playbooks',
    icon: '🧩',
    to: '/docs/knowledge-base/introduction',
  },
  {
    title: 'Training & Certifications',
    icon: '🎓',
    to: '/docs/knowledge-base/introduction',
  },
  {
    title: 'Automation & AI Tools',
    icon: '🔧',
    to: '/docs/knowledge-base/introduction',
  },
  {
    title: 'HR Forms & Policies',
    icon: '💼',
    to: '/docs/hr/overview',
  },
  {
    title: 'Finance Processes & Approvals',
    icon: '💰',
    to: '/docs/finance/overview',
  },
];

function QuickLinkCard({title, icon, to}: QuickLinkItem) {
  return (
    <div className={clsx('col col--4', styles.quickLinkCol)}>
      <Link to={to} className={styles.quickLinkCard}>
        <div className={styles.quickLinkIcon}>{icon}</div>
        <div className={styles.quickLinkTitle}>{title}</div>
      </Link>
    </div>
  );
}

export default function QuickLinks(): ReactNode {
  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <div className="text--center margin-bottom--lg">
          <Heading as="h2">Quick Access</Heading>
          <p className={styles.quickLinksSubtitle}>
            Jump directly to the resources you need
          </p>
        </div>
        <div className="row">
          {QuickLinkList.map((props, idx) => (
            <QuickLinkCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
