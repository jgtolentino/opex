'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import styles from './AnimatedStats.module.css';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon?: string;
}

interface AnimatedStatsProps {
  stats: Stat[];
}

export function AnimatedStats({ stats }: AnimatedStatsProps) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className={styles.statsSection}
      variants={container}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <motion.div key={index} className={styles.statCard} variants={item}>
            {stat.icon && <div className={styles.statIcon}>{stat.icon}</div>}

            <div className={styles.statValue}>
              {stat.prefix}
              {inView && (
                <CountUp
                  start={0}
                  end={stat.value}
                  duration={2.5}
                  decimals={stat.decimals || 0}
                  separator=","
                />
              )}
              {stat.suffix}
            </div>

            <div className={styles.statLabel}>{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
