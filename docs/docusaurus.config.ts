import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'OpEx Documentation Hub',
  tagline: 'Comprehensive operational excellence documentation',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://jgtolentino.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/opex/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'jgtolentino', // Usually your GitHub org/user name.
  projectName: 'opex', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Allow broken images during initial development
  markdown: {
    format: 'mdx',
    mermaid: false,
    hooks: {
      onBrokenMarkdownImages: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/jgtolentino/opex/tree/main/docs/',
          remarkPlugins: [],
          rehypePlugins: [],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/jgtolentino/opex/tree/main/docs/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'OpEx Docs',
      logo: {
        alt: 'OpEx Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'https://nextjs-notion-starter-kit-eight-iota.vercel.app',
          label: '← Home',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'knowledgeBaseSidebar',
          position: 'left',
          label: 'Knowledge Base',
        },
        {
          type: 'docSidebar',
          sidebarId: 'hrSidebar',
          position: 'left',
          label: 'HR',
        },
        {
          type: 'docSidebar',
          sidebarId: 'financeSidebar',
          position: 'left',
          label: 'Finance',
        },
        {to: '/blog', label: 'Updates', position: 'left'},
        {
          href: 'https://github.com/jgtolentino/opex',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Knowledge Base',
              to: '/docs/knowledge-base/introduction',
            },
            {
              label: 'HR Workflows',
              to: '/docs/hr/overview',
            },
            {
              label: 'Finance Policies',
              to: '/docs/finance/overview',
            },
          ],
        },
        {
          title: 'Quick Links',
          items: [
            {
              label: 'Glossary',
              to: '/docs/knowledge-base/glossary',
            },
            {
              label: 'FAQ',
              to: '/docs/knowledge-base/faq',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Updates',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/jgtolentino/opex',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpEx Documentation. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
