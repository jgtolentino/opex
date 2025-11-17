'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TestimonialCarousel.module.css';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  organization: string;
  avatar?: string;
  stats?: {
    label: string;
    value: string;
  };
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      'OpEx transformed how we manage processes across our 8 agencies. The AI recommendations alone saved us 40+ hours per month.',
    author: 'Jake Tolentino',
    role: 'Finance Process Manager',
    organization: 'Finance SSC',
    stats: {
      label: 'Time Saved',
      value: '40+ hrs/mo',
    },
  },
  {
    id: 2,
    quote:
      'The process mining capabilities gave us visibility we never had before. We identified bottlenecks within days, not months.',
    author: 'Maria Santos',
    role: 'Operations Director',
    organization: 'RIM',
    stats: {
      label: 'Bottlenecks Found',
      value: '12 critical',
    },
  },
  {
    id: 3,
    quote:
      'Implementing workflow automation with OpEx reduced our month-end closing time from 5 days to 2 days. Game-changing.',
    author: 'John Cruz',
    role: 'Finance Controller',
    organization: 'CKVC',
    stats: {
      label: 'Time Reduction',
      value: '60% faster',
    },
  },
  {
    id: 4,
    quote:
      'The BPM AI agents act like having 5 expert consultants on demand. Best investment we made for operational excellence.',
    author: 'Anna Reyes',
    role: 'COO',
    organization: 'BOM',
    stats: {
      label: 'ROI',
      value: '420%',
    },
  },
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className={styles.carouselSection}>
      <div className={styles.container}>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          What Our Users Say
        </motion.h2>

        <div className={styles.carouselContainer}>
          <button
            className={`${styles.navButton} ${styles.navPrevious}`}
            onClick={goToPrevious}
            aria-label="Previous testimonial"
          >
            ‹
          </button>

          <div className={styles.carouselWrapper}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className={styles.testimonialCard}
              >
                <div className={styles.quoteIcon}>"</div>
                <p className={styles.quote}>{testimonials[current].quote}</p>

                <div className={styles.authorSection}>
                  <div className={styles.authorInfo}>
                    <div className={styles.authorName}>
                      {testimonials[current].author}
                    </div>
                    <div className={styles.authorRole}>
                      {testimonials[current].role}
                    </div>
                    <div className={styles.authorOrg}>
                      {testimonials[current].organization}
                    </div>
                  </div>

                  {testimonials[current].stats && (
                    <div className={styles.statsCard}>
                      <div className={styles.statsValue}>
                        {testimonials[current].stats.value}
                      </div>
                      <div className={styles.statsLabel}>
                        {testimonials[current].stats.label}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={goToNext}
            aria-label="Next testimonial"
          >
            ›
          </button>
        </div>

        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === current ? styles.dotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
