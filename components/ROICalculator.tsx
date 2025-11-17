'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ROICalculator.module.css';

interface CalculatorInputs {
  numProcesses: number;
  avgManualHours: number;
  hourlyRate: number;
  errorRate: number;
  avgErrorCost: number;
}

export function ROICalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    numProcesses: 10,
    avgManualHours: 20,
    hourlyRate: 50,
    errorRate: 5,
    avgErrorCost: 500,
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs({ ...inputs, [field]: value });
  };

  // Calculations
  const monthlyManualCost = inputs.numProcesses * inputs.avgManualHours * inputs.hourlyRate;
  const monthlyErrorCost = inputs.numProcesses * (inputs.errorRate / 100) * inputs.avgErrorCost;
  const totalMonthlyCost = monthlyManualCost + monthlyErrorCost;

  // Assuming 60% automation and 80% error reduction
  const automationSavings = monthlyManualCost * 0.6;
  const errorReduction = monthlyErrorCost * 0.8;
  const totalMonthlySavings = automationSavings + errorReduction;

  const annualSavings = totalMonthlySavings * 12;
  const platformCost = 3000; // Annual platform cost
  const netAnnualSavings = annualSavings - platformCost;
  const roi = ((netAnnualSavings / platformCost) * 100).toFixed(0);
  const paybackMonths = (platformCost / totalMonthlySavings).toFixed(1);

  return (
    <div className={styles.calculatorSection}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>Calculate Your ROI</h2>
          <p className={styles.subtitle}>
            See how much you can save with process automation
          </p>

          <button
            className={styles.toggleButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '📊 Hide Calculator' : '🧮 Calculate Your Savings'}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                className={styles.calculator}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className={styles.calculatorGrid}>
                  {/* Inputs */}
                  <div className={styles.inputsColumn}>
                    <h3 className={styles.columnTitle}>Your Current State</h3>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>
                        Number of processes per month
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={inputs.numProcesses}
                        onChange={(e) =>
                          handleChange('numProcesses', parseInt(e.target.value))
                        }
                        className={styles.slider}
                      />
                      <div className={styles.value}>{inputs.numProcesses}</div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>
                        Average manual hours per process
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={inputs.avgManualHours}
                        onChange={(e) =>
                          handleChange('avgManualHours', parseInt(e.target.value))
                        }
                        className={styles.slider}
                      />
                      <div className={styles.value}>{inputs.avgManualHours} hrs</div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>
                        Average hourly rate (USD)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={inputs.hourlyRate}
                        onChange={(e) =>
                          handleChange('hourlyRate', parseInt(e.target.value))
                        }
                        className={styles.slider}
                      />
                      <div className={styles.value}>${inputs.hourlyRate}/hr</div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>
                        Current error rate (%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={inputs.errorRate}
                        onChange={(e) =>
                          handleChange('errorRate', parseInt(e.target.value))
                        }
                        className={styles.slider}
                      />
                      <div className={styles.value}>{inputs.errorRate}%</div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>
                        Average cost per error (USD)
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        value={inputs.avgErrorCost}
                        onChange={(e) =>
                          handleChange('avgErrorCost', parseInt(e.target.value))
                        }
                        className={styles.slider}
                      />
                      <div className={styles.value}>${inputs.avgErrorCost.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className={styles.resultsColumn}>
                    <h3 className={styles.columnTitle}>Your Potential Savings</h3>

                    <motion.div
                      className={styles.resultCard}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className={styles.resultLabel}>Monthly Savings</div>
                      <div className={styles.resultValue}>
                        ${totalMonthlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </motion.div>

                    <motion.div
                      className={styles.resultCard}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <div className={styles.resultLabel}>Annual Savings</div>
                      <div className={styles.resultValue}>
                        ${annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </motion.div>

                    <motion.div
                      className={styles.resultCard}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className={styles.resultLabel}>ROI</div>
                      <div className={styles.resultValue}>{roi}%</div>
                    </motion.div>

                    <motion.div
                      className={styles.resultCard}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <div className={styles.resultLabel}>Payback Period</div>
                      <div className={styles.resultValue}>{paybackMonths} months</div>
                    </motion.div>

                    <div className={styles.breakdown}>
                      <h4 className={styles.breakdownTitle}>Breakdown:</h4>
                      <div className={styles.breakdownItem}>
                        <span>Labor cost savings (60% automation)</span>
                        <span className={styles.breakdownValue}>
                          ${automationSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo
                        </span>
                      </div>
                      <div className={styles.breakdownItem}>
                        <span>Error reduction (80% fewer errors)</span>
                        <span className={styles.breakdownValue}>
                          ${errorReduction.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo
                        </span>
                      </div>
                      <div className={styles.breakdownItem}>
                        <span>Platform cost</span>
                        <span className={styles.breakdownValue}>
                          ${(platformCost / 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo
                        </span>
                      </div>
                    </div>

                    <motion.button
                      className={styles.ctaButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Personalized ROI Analysis →
                    </motion.button>
                  </div>
                </div>

                <div className={styles.disclaimer}>
                  * Results are estimates based on industry averages. Actual savings may vary based on your specific processes and implementation.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
