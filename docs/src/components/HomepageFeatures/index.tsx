import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Standardized & Clear',
    icon: '🧭',
    description: (
      <>
        Every workflow, policy, and requirement in one place — aligned, versioned, and easy to follow.
      </>
    ),
  },
  {
    title: 'Built for Scale',
    icon: '⚙️',
    description: (
      <>
        Designed to evolve with the organization: automation-ready, audit-friendly, and role-based.
      </>
    ),
  },
  {
    title: 'Faster, Better Execution',
    icon: '🚀',
    description: (
      <>
        Spend less time searching for "how things work" — and more time executing confidently.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon}>{icon}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
