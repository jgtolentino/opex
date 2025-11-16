import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Demo.module.css';

export default function DemoPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    role: '',
    phone: '',
    message: '',
    interests: [] as string[],
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (value: string) => {
    const interests = formData.interests.includes(value)
      ? formData.interests.filter(i => i !== value)
      : [...formData.interests, value];

    setFormData({ ...formData, interests });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Integrate with your backend/CRM
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Demo request:', formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit demo request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Head>
          <title>Thank You | OpEx Platform</title>
        </Head>
        <div className={styles.successPage}>
          <div className={styles.successContent}>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.successTitle}>Thank you for your interest!</h1>
            <p className={styles.successText}>
              We've received your demo request and will reach out to you within 1 business day to schedule your personalized demonstration.
            </p>
            <p className={styles.successText}>
              In the meantime, feel free to explore our resources:
            </p>
            <div className={styles.successLinks}>
              <Link href="/portal" className={styles.successLink}>
                Explore Documentation →
              </Link>
              <Link href="/transformation" className={styles.successLink}>
                Learn About Transformation →
              </Link>
              <Link href="/skills" className={styles.successLink}>
                Discover BPM Skills →
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Request a Demo | OpEx Platform</title>
        <meta
          name="description"
          content="See how OpEx can transform your finance operations with AI-powered process intelligence"
        />
      </Head>

      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Request a Personalized Demo</h1>
            <p className={styles.heroSubtitle}>
              Discover how OpEx can help you transform your business processes with AI-powered intelligence and automation
            </p>
          </div>
        </section>

        <section className={styles.formSection}>
          <div className={styles.container}>
            <div className={styles.layout}>
              <div className={styles.formColumn}>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName" className={styles.label}>
                        First Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className={styles.input}
                        placeholder="John"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="lastName" className={styles.label}>
                        Last Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className={styles.input}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                      Work Email <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={styles.input}
                      placeholder="john.doe@company.com"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="organization" className={styles.label}>
                      Organization <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      required
                      className={styles.input}
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="role" className={styles.label}>
                      Role <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Select your role</option>
                      <option value="cfo">CFO / Finance Director</option>
                      <option value="controller">Finance Controller</option>
                      <option value="process-manager">Process Manager</option>
                      <option value="hr-director">HR Director</option>
                      <option value="operations">Operations Manager</option>
                      <option value="it">IT Manager / CTO</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      I'm interested in:
                    </label>
                    <div className={styles.checkboxGroup}>
                      {[
                        { value: 'process-mining', label: 'Process Mining & Discovery' },
                        { value: 'process-modeling', label: 'Process Modeling (BPMN)' },
                        { value: 'ai-assistants', label: 'AI-Powered Assistants' },
                        { value: 'workflow-automation', label: 'Workflow Automation' },
                        { value: 'process-intelligence', label: 'Process Intelligence & Analytics' },
                        { value: 'erp-transformation', label: 'ERP Transformation' },
                      ].map(option => (
                        <label key={option.value} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(option.value)}
                            onChange={() => handleCheckboxChange(option.value)}
                            className={styles.checkbox}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.label}>
                      Tell us about your needs (optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={styles.textarea}
                      placeholder="What challenges are you looking to solve? How many processes/users would you like to manage?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.submitButton}
                  >
                    {loading ? 'Submitting...' : 'Request Demo'}
                  </button>

                  <p className={styles.privacy}>
                    By submitting this form, you agree to our{' '}
                    <Link href="/privacy">Privacy Policy</Link>. We'll never share your information.
                  </p>
                </form>
              </div>

              <div className={styles.infoColumn}>
                <div className={styles.infoCard}>
                  <h3 className={styles.infoTitle}>What to expect</h3>
                  <ul className={styles.infoList}>
                    <li>
                      <span className={styles.infoIcon}>📅</span>
                      <span>Response within 1 business day</span>
                    </li>
                    <li>
                      <span className={styles.infoIcon}>⏱️</span>
                      <span>45-minute personalized demo</span>
                    </li>
                    <li>
                      <span className={styles.infoIcon}>🎯</span>
                      <span>Tailored to your specific needs</span>
                    </li>
                    <li>
                      <span className={styles.infoIcon}>💡</span>
                      <span>Best practices & recommendations</span>
                    </li>
                    <li>
                      <span className={styles.infoIcon}>🚀</span>
                      <span>Free trial access available</span>
                    </li>
                  </ul>
                </div>

                <div className={styles.infoCard}>
                  <h3 className={styles.infoTitle}>What you'll see</h3>
                  <ul className={styles.infoList}>
                    <li>Process modeling with BPMN 2.0</li>
                    <li>AI-powered process discovery</li>
                    <li>Intelligent process recommendations</li>
                    <li>Real-time analytics dashboards</li>
                    <li>Workflow automation examples</li>
                    <li>Integration capabilities</li>
                  </ul>
                </div>

                <div className={styles.testimonial}>
                  <p className={styles.testimonialText}>
                    "OpEx transformed how we manage processes across our 8 agencies. The AI recommendations alone saved us 40+ hours per month."
                  </p>
                  <p className={styles.testimonialAuthor}>
                    <strong>Jake Tolentino</strong>
                    <br />
                    Finance Process Manager
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
