import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { VideoSection } from '@/components/VideoSection';
import { AnimatedStats } from '@/components/AnimatedStats';
import { ROICalculator } from '@/components/ROICalculator';
import { InteractiveProcessFlow } from '@/components/InteractiveProcessFlow';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import styles from '@/styles/Transformation.module.css';

export default function TransformationPage() {
  return (
    <>
      <Head>
        <title>Business Transformation Management | OpEx Platform</title>
        <meta
          name="description"
          content="Transform your finance operations with AI-powered process intelligence, automation, and continuous improvement"
        />
      </Head>

      <div className={styles.page}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Business Transformation Management
            </h1>
            <p className={styles.heroSubtitle}>
              The journey to become an agile, sustainable, and resilient finance organization requires transformation
            </p>
            <div className={styles.heroCTA}>
              <Link href="/demo" className={styles.buttonPrimary}>
                Request a Demo
              </Link>
              <Link href="/portal" className={styles.buttonSecondary}>
                Explore the Platform
              </Link>
            </div>
          </div>
        </section>

        {/* Key Statistic */}
        <section className={styles.statSection}>
          <div className={styles.container}>
            <div className={styles.statCard}>
              <h2 className={styles.statHeading}>
                <span className={styles.statNumber}>80%</span> of finance leaders feel they have clear objectives
              </h2>
              <p className={styles.statText}>
                yet around <span className={styles.highlight}>40% struggle to turn their vision into actionable plans</span>.
              </p>
              <Link href="/resources/transformation-study" className={styles.linkButton}>
                Find out why →
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className={styles.valueSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              Bring out the best in your business transformation
            </h2>
            <p className={styles.sectionSubtitle}>
              This is where OpEx steps in.
            </p>

            <div className={styles.valueGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>⚡</div>
                <h3 className={styles.valueTitle}>Adapt and succeed: Agility wins</h3>
                <p className={styles.valueText}>
                  Learn how your finance organization can stay at the forefront of change in a constantly evolving regulatory environment. Become the SSC that sets the pace.
                </p>
                <Link href="/solutions/agility" className={styles.valueLink}>
                  Adapt. Innovate. Thrive. →
                </Link>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🛡️</div>
                <h3 className={styles.valueTitle}>Thrive and grow: Build resilience</h3>
                <p className={styles.valueText}>
                  Strengthen your financial operations against disruptions. Build resilient processes that adapt to change while maintaining compliance and efficiency.
                </p>
                <Link href="/solutions/resilience" className={styles.valueLink}>
                  Build resilience →
                </Link>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🌱</div>
                <h3 className={styles.valueTitle}>Future-proof your operations: Become sustainable</h3>
                <p className={styles.valueText}>
                  Create sustainable financial processes that scale with your growth. Reduce manual work, eliminate waste, and focus on strategic value creation.
                </p>
                <Link href="/solutions/sustainability" className={styles.valueLink}>
                  Go sustainable →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Animated Statistics */}
        <AnimatedStats
          stats={[
            { value: 60, suffix: '%', label: 'Time Savings', icon: '⏱️' },
            { value: 80, suffix: '%', label: 'Error Reduction', icon: '✓' },
            { value: 420, suffix: '%', label: 'Average ROI', icon: '📈' },
            { value: 2.2, decimals: 1, label: 'Months to Payback', icon: '💰' },
          ]}
        />

        {/* From Strategy to Execution */}
        <section className={styles.strategySection}>
          <div className={styles.container}>
            <div className={styles.strategyHeader}>
              <h2 className={styles.sectionTitle}>Business Transformation</h2>
              <p className={styles.sectionSubtitle}>From strategy to execution</p>
              <p className={styles.strategyDescription}>
                Realize holistic, data-driven business transformation across your finance organization – unlocking faster time to insight and adaptation.
              </p>
              <Link href="/portal" className={styles.buttonPrimary}>
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <VideoSection
          title="See OpEx in Action"
          description="Watch how organizations are transforming their processes with AI-powered intelligence and automation"
          videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          thumbnail="/images/video-thumbnail.jpg"
        />

        {/* Four Pillars */}
        <section className={styles.pillarsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              The four pillars for successful business transformation
            </h2>

            <div className={styles.pillarsGrid}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>👥</div>
                <h3 className={styles.pillarTitle}>People</h3>
                <p className={styles.pillarText}>
                  Taking people on a journey of change while they're running the day-to-day business requires careful planning, holistic change management, company-wide collaboration, transparent communication, and effective enablement.
                </p>
              </div>

              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>🔄</div>
                <h3 className={styles.pillarTitle}>Processes</h3>
                <p className={styles.pillarText}>
                  Process transformation needs a clear understanding of current processes, a strategy based on facts and data, and a plan for the transition from the current state to the future state.
                </p>
              </div>

              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>💻</div>
                <h3 className={styles.pillarTitle}>Applications</h3>
                <p className={styles.pillarText}>
                  Understand how applications and their dependencies support the business today and how they should be managed, transformed, and organized to support the IT landscape needed to run the business tomorrow.
                </p>
              </div>

              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>📊</div>
                <h3 className={styles.pillarTitle}>Data</h3>
                <p className={styles.pillarText}>
                  Gain comprehensive observability and management of the data gathered by your organization so that during the transformation, the quality of data transitioned from the as-is can determine the value of the insights you'll get in the to-be.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section className={styles.productSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              Transform your business processes – fast and at scale
            </h2>

            <div className={styles.productGrid}>
              <div className={styles.productCard}>
                <div className={styles.productLogo}>
                  <span className={styles.productBadge}>OpEx RAG</span>
                </div>
                <h3 className={styles.productTitle}>AI-Powered Process Intelligence</h3>
                <p className={styles.productText}>
                  Transform your knowledge base into actionable insights with RAG-powered assistants for HR, Finance, and Operations.
                </p>
                <Link href="/solutions/rag" className={styles.productLink}>
                  Find out more →
                </Link>
              </div>

              <div className={styles.productCard}>
                <div className={styles.productLogo}>
                  <span className={styles.productBadge}>BPM Skills</span>
                </div>
                <h3 className={styles.productTitle}>Specialized AI Agents</h3>
                <p className={styles.productText}>
                  Transform your operations with AI agents specialized in process analysis, automation development, and continuous improvement.
                </p>
                <Link href="/skills" className={styles.productLink}>
                  Find out more →
                </Link>
              </div>

              <div className={styles.productCard}>
                <div className={styles.productLogo}>
                  <span className={styles.productBadge}>Automation Platform</span>
                </div>
                <h3 className={styles.productTitle}>Workflow Automation</h3>
                <p className={styles.productText}>
                  Maximize the value of all your data across systems with an open and multi-cloud architecture powered by n8n and Supabase.
                </p>
                <Link href="/workflows" className={styles.productLink}>
                  Find out more →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Process Flow - Five-Stage Approach */}
        <InteractiveProcessFlow />

        {/* ROI Calculator */}
        <ROICalculator />

        {/* Trust Section */}
        <section className={styles.trustSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              Trusted by agencies across the organization
            </h2>

            <div className={styles.agencyGrid}>
              <div className={styles.agencyLogo}>RIM</div>
              <div className={styles.agencyLogo}>CKVC</div>
              <div className={styles.agencyLogo}>BOM</div>
              <div className={styles.agencyLogo}>AGENCY 4</div>
              <div className={styles.agencyLogo}>AGENCY 5</div>
              <div className={styles.agencyLogo}>AGENCY 6</div>
              <div className={styles.agencyLogo}>AGENCY 7</div>
              <div className={styles.agencyLogo}>AGENCY 8</div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className={styles.getStartedSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Get started, your way</h2>

            <div className={styles.useCaseGrid}>
              <div className={styles.useCaseCard}>
                <div className={styles.useCaseIcon}>🔄</div>
                <h3 className={styles.useCaseTitle}>ERP Transformation</h3>
                <p className={styles.useCaseText}>
                  Accelerate and modernize your Odoo ERP transformation whilst embracing Innovation.
                </p>
                <Link href="/use-cases/erp" className={styles.useCaseLink}>
                  Find out more →
                </Link>
              </div>

              <div className={styles.useCaseCard}>
                <div className={styles.useCaseIcon}>📈</div>
                <h3 className={styles.useCaseTitle}>Continuous Improvement</h3>
                <p className={styles.useCaseText}>
                  Realize ambitious innovation and growth through continuous process improvement.
                </p>
                <Link href="/use-cases/continuous-improvement" className={styles.useCaseLink}>
                  Find out more →
                </Link>
              </div>

              <div className={styles.useCaseCard}>
                <div className={styles.useCaseIcon}>🤖</div>
                <h3 className={styles.useCaseTitle}>Generative AI</h3>
                <p className={styles.useCaseText}>
                  Get instant answers to your process questions with generative AI in OpEx RAG.
                </p>
                <Link href="/use-cases/ai" className={styles.useCaseLink}>
                  Find out more →
                </Link>
              </div>

              <div className={styles.useCaseCard}>
                <div className={styles.useCaseIcon}>🎯</div>
                <h3 className={styles.useCaseTitle}>BPM Agent Skills</h3>
                <p className={styles.useCaseText}>
                  A powerful offering that aids you in accelerating the time to insight and time to adapt.
                </p>
                <Link href="/skills" className={styles.useCaseLink}>
                  Find out more →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Carousel */}
        <TestimonialCarousel />

        {/* What's New */}
        <section className={styles.newsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>What's new</h2>

            <div className={styles.newsGrid}>
              <div className={styles.newsCard}>
                <div className={styles.newsType}>RESEARCH REPORT</div>
                <h3 className={styles.newsTitle}>
                  OpEx Platform recognized for AI-powered transformation
                </h3>
                <p className={styles.newsText}>
                  2025 Study on AI in Business Process Management
                </p>
                <Link href="/resources/ai-report" className={styles.newsLink}>
                  Download the report →
                </Link>
              </div>

              <div className={styles.newsCard}>
                <div className={styles.newsType}>BLOG POST</div>
                <h3 className={styles.newsTitle}>
                  Strengthening your business transformation capability
                </h3>
                <p className={styles.newsText}>
                  Learn how you can mitigate risks in business transformation.
                </p>
                <Link href="/blog/transformation-capability" className={styles.newsLink}>
                  Read the blog post →
                </Link>
              </div>

              <div className={styles.newsCard}>
                <div className={styles.newsType}>WHITE PAPER</div>
                <h3 className={styles.newsTitle}>
                  How to harness AI in business transformation management
                </h3>
                <p className={styles.newsText}>
                  Learn about the role of AI in business transformation management and concrete steps toward successful implementation.
                </p>
                <Link href="/resources/ai-whitepaper" className={styles.newsLink}>
                  Download for free →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={styles.finalCTA}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>
                Ready to get started on your own journey?
              </h2>
              <p className={styles.ctaText}>
                If you're looking to stay ahead of the competition and start transforming your business today, then request a personalized meeting with an OpEx expert to learn more about how we can help.
              </p>
              <Link href="/demo" className={styles.buttonPrimary}>
                Request a Demo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 3600, // Revalidate every hour
  };
};
