'use client';

import React from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import styles from './VideoSection.module.css';

interface VideoSectionProps {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  autoplay?: boolean;
  controls?: boolean;
}

export function VideoSection({
  title,
  description,
  videoUrl,
  thumbnail,
  autoplay = false,
  controls = true,
}: VideoSectionProps) {
  return (
    <motion.div
      className={styles.videoSection}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.container}>
        {title && (
          <motion.h2
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {title}
          </motion.h2>
        )}

        {description && (
          <motion.p
            className={styles.description}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {description}
          </motion.p>
        )}

        <motion.div
          className={styles.videoWrapper}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className={styles.playerContainer}>
            <ReactPlayer
              url={videoUrl}
              width="100%"
              height="100%"
              controls={controls}
              playing={autoplay}
              light={thumbnail}
              className={styles.player}
              config={{
                youtube: {
                  playerVars: { modestbranding: 1, rel: 0 },
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
