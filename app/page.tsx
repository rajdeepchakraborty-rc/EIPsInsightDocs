'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export default function Home() {
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [showSupportBanner, setShowSupportBanner] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState('about');
  const [activeItemId, setActiveItemId] = useState('about-overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    about: true,
    standards: true,
    explore: true,
    analytics: true,
    insights: true,
    tools: true,
    upgrade: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaderVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDark);
  }, [isDark]);

  useEffect(() => {
    const sectionIdLookup = new Map(navSections.map((section) => [section.sectionId, section.id]));
    const itemIdLookup = new Map(
      navSections.flatMap((section) => section.items.map((item) => [item.sectionId, section.id] as const)),
    );

    const sectionVisibility = new Map<string, number>();
    const itemVisibility = new Map<string, number>();

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionKey = sectionIdLookup.get(entry.target.id);
          if (!sectionKey) {
            return;
          }

          sectionVisibility.set(sectionKey, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        const visibleSections = navSections
          .map((section) => ({ id: section.id, ratio: sectionVisibility.get(section.id) ?? 0 }))
          .filter((section) => section.ratio > 0);

        if (!visibleSections.length) {
          return;
        }

        const nextActiveSection = visibleSections.reduce((best, current) => (
          current.ratio > best.ratio ? current : best
        )).id;

        setActiveSectionId((prev) => (prev === nextActiveSection ? prev : nextActiveSection));
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.7],
        rootMargin: '-20% 0px -55% 0px',
      },
    );

    const itemObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const itemKey = itemIdLookup.get(entry.target.id);
          if (!itemKey) {
            return;
          }

          itemVisibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        const visibleItems = Array.from(itemVisibility.entries()).filter(([, ratio]) => ratio > 0);
        if (!visibleItems.length) {
          return;
        }

        const [nextActiveItem] = visibleItems.reduce((best, current) => (
          current[1] > best[1] ? current : best
        ));

        const ownerSection = itemIdLookup.get(nextActiveItem);
        if (!ownerSection) {
          return;
        }

        setActiveItemId((prev) => (prev === nextActiveItem ? prev : nextActiveItem));
        setActiveSectionId((prev) => (prev === ownerSection ? prev : ownerSection));
      },
      {
        threshold: [0.15, 0.3, 0.5, 0.7],
        rootMargin: '-18% 0px -60% 0px',
      },
    );

    navSections.forEach((section) => {
      const sectionElement = document.getElementById(section.sectionId);
      if (sectionElement) {
        sectionObserver.observe(sectionElement);
      }

      section.items.forEach((item) => {
        const itemElement = document.getElementById(item.sectionId);
        if (itemElement) {
          itemObserver.observe(itemElement);
        }
      });
    });

    return () => {
      sectionObserver.disconnect();
      itemObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setExpandedSections((prev) => {
      if (prev[activeSectionId]) {
        return prev;
      }

      return {
        ...prev,
        [activeSectionId]: true,
      };
    });
  }, [activeSectionId]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const scrollToSection = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeProposalsTotal = 1152;
  const activeProposalsDraft = 349;
  const activeProposalsOther = activeProposalsTotal - activeProposalsDraft;

  const navSections = [
    {
      id: 'about',
      group: 'Intro',
      label: 'What is EIPInsight',
      sectionId: 'about-us',
      items: [
        { label: 'Overview', sectionId: 'about-overview' },
        { label: 'Why We Built This', sectionId: 'why-we-built-this' },
        { label: 'How People Use It', sectionId: 'how-people-use-it' },
      ],
    },
    {
      id: 'standards',
      group: 'Standards & Governance',
      label: 'Standards',
      sectionId: 'standards',
      items: [
        { label: 'All Standards', sectionId: 'standards-overview' },
        { label: 'EIPs Explained', sectionId: 'eips-explained' },
        { label: 'ERCs Explained', sectionId: 'ercs-explained' },
        { label: 'RIPs Explained', sectionId: 'rips-explained' },
      ],
    },
    {
      id: 'explore',
      group: 'Standards & Governance',
      label: 'Explore',
      sectionId: 'explore',
      items: [
        { label: 'Explore Hub', sectionId: 'explore-hub' },
        { label: 'By Year', sectionId: 'explore-by-year' },
        { label: 'By Status', sectionId: 'explore-by-status' },
        { label: 'By Role', sectionId: 'explore-by-role' },
        { label: 'Trending', sectionId: 'explore-trending' },
      ],
    },
    {
      id: 'upgrade',
      group: 'Standards & Governance',
      label: 'Upgrade Watch',
      sectionId: 'upgrades',
      items: [
        { label: 'What is Upgrade Watch?', sectionId: 'what-is-upgrade-watch' },
        { label: 'Reading the Timeline', sectionId: 'reading-the-timeline' },
        { label: 'Upcoming: Glamsterdam', sectionId: 'upcoming-glamsterdam' },
      ],
    },
    {
      id: 'analytics',
      group: 'Analytics & Insights',
      label: 'Analytics',
      sectionId: 'analytics',
      items: [
        { label: 'EIPs', sectionId: 'analytics-eips' },
        { label: 'PRs', sectionId: 'analytics-prs' },
        { label: 'Issues', sectionId: 'analytics-issues' },
        { label: 'Board', sectionId: 'analytics-board' },
        { label: 'Editors', sectionId: 'analytics-editors' },
        { label: 'Reviewers', sectionId: 'analytics-reviewers' },
        { label: 'Authors', sectionId: 'analytics-authors' },
        { label: 'Contributors', sectionId: 'analytics-contributors' },
      ],
    },
    {
      id: 'insights',
      group: 'Analytics & Insights',
      label: 'Insights',
      sectionId: 'insights',
      items: [
        { label: 'Overview', sectionId: 'insights-overview' },
        { label: 'Year-Month Analysis', sectionId: 'insights-year-month' },
        { label: 'Governance & Process', sectionId: 'insights-governance-process' },
        { label: 'Editorial Commentary', sectionId: 'insights-editorial-commentary' },
      ],
    },
    {
      id: 'tools',
      group: 'Productivity',
      label: 'Tools',
      sectionId: 'tools',
      items: [
        { label: 'Overview', sectionId: 'tools-overview' },
        { label: 'EIP Builder', sectionId: 'tools-eip-builder' },
        { label: 'Timeline', sectionId: 'tools-timeline' },
      ],
    },
  ];

  const faqGroups = [
    {
      kicker: 'Get Started',
      title: 'Basics (6)',
      sectionId: 'faq-basics',
      items: [
        {
          question: 'What is an EIP?',
          answer:
            'An EIP (Ethereum Improvement Proposal) is a design document that introduces a feature, process change, or environment change for Ethereum. EIPs are the main mechanism for proposing and documenting protocol and ecosystem improvements.',
        },
        {
          question: 'What is an ERC?',
          answer:
            'An ERC (Ethereum Request for Comments) is a category of EIP focused on application-level standards such as token interfaces and contract conventions. ERC standards help wallets, apps, and tools interoperate consistently.',
        },
        {
          question: 'What is a RIP?',
          answer:
            'A RIP (Rollup Improvement Proposal) is a standards document for Layer 2 rollup systems. RIPs define improvements and shared conventions for rollup implementations and ecosystem coordination.',
        },
        {
          question: 'What is the difference between an EIP, ERC, and RIP?',
          answer:
            'EIP is the broad proposal framework for Ethereum improvements. ERCs are application-level standards within that framework. RIPs are rollup-focused standards for Layer 2 ecosystems. They share proposal mechanics but target different scopes.',
        },
        {
          question: 'Where should I start if I am new to Ethereum standards?',
          answer:
            'Start with EIP-1 to understand the proposal process. Then read a few widely used standards such as ERC-20 and ERC-721, and track current drafts to see how review and governance shape proposals over time.',
        },
        {
          question: 'How do I contribute to the EIP process?',
          answer:
            'You can contribute by drafting proposals, reviewing open drafts, commenting during Last Call, improving specifications, and helping with implementation feedback. Many contributors begin by improving existing drafts before opening a new proposal.',
        },
      ],
    },
    {
      kicker: 'Workflow',
      title: 'Process (7)',
      sectionId: 'faq-process',
      items: [
        {
          question: 'How does an EIP move from Draft to Final?',
          answer:
            'An EIP moves through statuses such as Draft, Review, Last Call, and Final. In Draft, the proposal evolves. Review and Last Call gather final feedback. Final means the proposal is accepted and considered complete from a standards perspective.',
        },
        {
          question: 'Who are EIP Editors?',
          answer:
            'EIP Editors maintain process quality. They review formatting and process compliance, coordinate status changes, and keep the repository organized. Editors do not unilaterally decide technical acceptance of proposals.',
        },
        {
          question: 'What is Last Call?',
          answer:
            'Last Call is the final review window before an EIP can become Final. It gives the community a final opportunity to comment and raise objections before status advancement.',
        },
        {
          question: 'How long does review usually take?',
          answer:
            'There is no fixed duration. Simple proposals can progress quickly, while complex or controversial ones can take months or longer. Review speed depends on technical complexity, editorial feedback, and community consensus.',
        },
        {
          question: 'What usually blocks a proposal from moving forward?',
          answer:
            'Common blockers include incomplete specifications, unresolved objections, weak implementation plans, missing test coverage, and unclear ecosystem impact. Coordination with upgrade timing can also delay status progression.',
        },
        {
          question: 'Who decides whether a proposal is accepted?',
          answer:
            'Acceptance is not controlled by one person. Editors manage process and quality, while technical acceptance depends on broad alignment across researchers, implementers, client teams, and community stakeholders.',
        },
        {
          question: 'Why does a proposal sometimes move backward in status?',
          answer:
            'Status can move backward when new issues are discovered, important objections arise, or substantial spec changes are needed. This is normal in open governance and helps prioritize correctness over speed.',
        },
      ],
    },
    {
      kicker: 'Platform',
      title: 'Platform (7)',
      sectionId: 'faq-platform',
      items: [
        {
          question: 'What does EIPInsight track?',
          answer:
            'EIPInsight tracks EIPs, ERCs, and RIPs across their lifecycle, plus pull request activity, governance signals, editor activity, contributor behavior, and proposal-level analytics to explain how standards evolve.',
        },
        {
          question: 'How often is data updated?',
          answer:
            'Core status and repository data are synchronized frequently from source repositories. Some aggregated analytics are cached and refreshed on intervals to balance freshness and performance.',
        },
        {
          question: 'Can I download data?',
          answer:
            'Yes. Most analytics and standards views support export workflows such as CSV or JSON so teams can run custom analysis outside the app.',
        },
        {
          question: 'Which EIPInsight pages should I use for different tasks?',
          answer:
            'Use Standards for proposal details, Analytics for trends and workload, and Governance for process context. The best path depends on whether you are researching, building, or coordinating reviews.',
        },
        {
          question: 'Does EIPInsight cover pull requests and issues too?',
          answer:
            'Yes. EIPInsight links standards data with pull requests, issue activity, review metadata, and governance context so you can understand both proposal text and implementation discussion.',
        },
        {
          question: 'Do I need an account or persona to use EIPInsight?',
          answer:
            'No. Most content is available without sign-in. Personas are preference presets that tune navigation and defaults for different workflows such as developer, editor, or researcher.',
        },
        {
          question: 'How current are analytics and board views?',
          answer:
            'Operational views are designed to stay close to source activity, while heavier analytics may use short-lived caching. This keeps dashboards responsive while preserving trustworthy trend reporting.',
        },
      ],
    },
  ];

  return (
    <>
      <style>{`
        :root {
     --bg: #ffffff;
--bg2: #f0f7f2;        /* was #f6f8fa — now greenish tint */
--bg3: #e0f0e8;        /* was #eaeef2 — now greenish tint */
--border: rgba(46,160,67,0.18);  /* was rgba(0,0,0,0.08) — green border */
--text: #1f2328;
--text2: #4a6754;      /* was #656d76 — greenish grey */
--accent: #2ea043;
--green-glow: rgba(46,160,67,0.12);
        }

        html.dark-mode {
          --bg: #0d1117;
          --bg2: #161b22;
          --bg3: #21262d;
          --border: rgba(255,255,255,0.08);
          --text: #e6edf3;
          --text2: #8b949e;
          --accent: #3fb950;
          --green-glow: rgba(63,185,80,0.12);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background-color: var(--bg);
          color: var(--text);
          font-family: var(--font-space-grotesk), 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 15.5px;
          font-weight: 400;
          line-height: 1.6;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        h1 { font-size: 52px; }
        h2 { font-size: 36px; }
        h3 { font-size: 22px; }

        /* LOADER */
        .loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
          z-index: 9999;
          opacity: 1;
          visibility: visible;
          transition: opacity 0.5s ease, visibility 0.5s ease;
        }

        .loader.hidden {
          opacity: 0;
          visibility: hidden;
        }

        .loader-logo {
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .loader-logo-accent {
          color: var(--accent);
        }

        .loader-bar {
          width: 200px;
          height: 3px;
          background-color: var(--bg2);
          border-radius: 2px;
          overflow: hidden;
        }

        .loader-bar-fill {
          height: 100%;
          background-color: var(--accent);
          width: 0%;
          animation: barFill 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes barFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .loader-text {
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 13px;
          color: var(--text2);
          height: 20px;
          min-width: 180px;
          text-align: center;
          position: relative;
        }

        .loader-text-item {
          position: absolute;
          opacity: 0;
          animation: textCycle 6s steps(1, end) infinite;
        }

        .loader-text-item:nth-child(1) { animation-delay: 0s; }
        .loader-text-item:nth-child(2) { animation-delay: 2s; }
        .loader-text-item:nth-child(3) { animation-delay: 4s; }

        @keyframes textCycle {
          0% { opacity: 1; }
          33% { opacity: 1; }
          34% { opacity: 0; }
          100% { opacity: 0; }
        }

        /* NAVBAR */
        .navbar {
          position: fixed;
          top: var(--support-banner-height, 0px);
          left: 0;
          right: 0;
          height: 60px;
          background-color: var(--bg);
          backdrop-filter: blur(12px);
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 100;
          transition: box-shadow 0.3s ease;
        }

        .navbar.scrolled {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

       html:not(.dark-mode) .navbar {
  background: rgba(240, 247, 242, 0.92);
  border-bottom: 1px solid rgba(46,160,67,0.22);
}

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .navbar-center {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .navbar-center a {
          color: var(--text2);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .navbar-center a:hover {
          color: var(--accent);
        }

        .navbar-right {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .navbar-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .navbar-icon:hover {
          transform: scale(1.1);
        }

        .theme-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text2);
          font-size: 20px;
          display: flex;
          align-items: center;
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .theme-toggle:hover {
          color: var(--accent);
          transform: rotate(180deg);
        }

        @media (max-width: 768px) {
          .navbar-center { display: none; }
        }

        /* SIDEBAR */
        .sidebar {
          position: fixed;
          left: 0;
          top: calc(60px + var(--support-banner-height, 0px));
          width: 260px;
          height: calc(100vh - 60px - var(--support-banner-height, 0px));
          background-color: var(--bg);
          border-right: 1px solid var(--border);
          padding: 24px 0;
          overflow-y: auto;
          z-index: 20;
        }

        html:not(.dark-mode) .sidebar {
  background-color: #f0f7f2;
  border-right: 1px solid rgba(46,160,67,0.22);
}
        .sidebar-section {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-group-label {
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text2);
          padding: 0 16px;
          margin: 8px 0 10px;
        }

        .sidebar-section:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .sidebar-section-title {
          font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin: 0 12px;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid #1a2a1a;
          background: transparent;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: border-color 0.3s ease, background-color 0.3s ease;
          user-select: none;
        }

        .sidebar-section-title.active {
          border: 1px solid rgba(63, 185, 80, 0.45);
          background: linear-gradient(180deg, rgba(31, 120, 91, 0.28) 0%, rgba(13, 17, 23, 0.4) 100%);
        }

        .sidebar-section-title:hover {
          border-color: #263b26;
        }

        .sidebar-section-title.active:hover {
          border-color: rgba(63, 185, 80, 0.45);
        }

        .sidebar-chevron {
          font-size: 12px;
          transition: transform 0.3s ease;
        }

        .sidebar-chevron.expanded {
          transform: rotate(90deg);
        }

        .sidebar-items {
          max-height: 500px;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .sidebar-items.collapsed {
          max-height: 0;
        }

        .sidebar-item {
          width: calc(100% - 8px);
          background: none;
          border: none;
          text-align: left;
          padding: 10px 20px;
          font-size: 14px;
          color: var(--text2);
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
          margin: 0 8px 0 0;
        }

        .sidebar-item:hover {
          background-color: var(--bg3);
          color: var(--text);
        }

        .sidebar-item.active {
          border-left-color: var(--accent);
          color: #ffffff;
          background-color: var(--green-glow);
        }

        /* MAIN CONTENT */
        .main-container {
          margin-left: 304px;
          width: calc(100vw - 304px);
          padding: calc(80px + var(--support-banner-height, 0px)) 28px 80px;
        }

        .main-inner {
          max-width: none;
          width: 100%;
          margin: 0;
        }

        @media (max-width: 768px) {
          .main-container {
            margin-left: 0;
            padding: calc(80px + var(--support-banner-height, 0px)) 16px 80px;
            width: 100%;
          }
          .sidebar { display: none; }
        }

        .support-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 44px 0 16px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          flex-wrap: wrap;
          z-index: 140;
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.02);
        }

        html:not(.dark-mode) .support-banner {
          background: rgba(240, 247, 242, 0.96);
        }

        .support-banner-link {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .support-banner-close {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: var(--text2);
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
        }

        .support-banner-close:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
        }

        .hero {
          margin-bottom: 80px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent);
          background-color: var(--green-glow);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 6px 12px;
          margin-bottom: 20px;
        }

        .hero h1 {
          margin-bottom: 16px;
          color: var(--text);
          max-width: 900px;
          font-size: clamp(38px, 5vw, 64px);
        }

        .hero h1 .accent {
          color: var(--accent);
        }

        .hero-subtitle {
          font-size: 19px;
          color: var(--text2);
          margin-bottom: 32px;
          line-height: 1.75;
          max-width: 820px;
          border-left: 3px solid var(--accent);
          padding-left: 14px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 6px;
          font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background-color: var(--accent);
          color: var(--bg);
          border: 2px solid var(--accent);
        }

        .btn-primary:hover {
          filter: brightness(1.1);
        }

        .btn-secondary {
          background-color: transparent;
          color: var(--text);
          border: 2px solid var(--border);
        }

        .btn-secondary:hover {
          background-color: var(--bg3);
          border-color: var(--accent);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 80px;
        }

        .stat-card {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          padding: 24px;
          border-radius: 8px;
          min-height: 184px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          gap: 14px;
        }

        .stat-number {
          font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 0;
          display: flex;
          align-items: baseline;
          justify-content: flex-start;
          gap: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: var(--text2);
          font-weight: 500;
        }

        .stat-card-active {
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
        }

        .stat-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .stat-kicker {
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text);
          margin-bottom: 4px;
        }

        .stat-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          border: 1px solid rgba(54, 211, 153, 0.35);
          background: rgba(16, 185, 129, 0.12);
          color: #45f3b5;
          font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 5px 10px;
        }

        .stat-number-active {
          font-size: clamp(42px, 5vw, 58px);
          justify-content: flex-start;
          margin-bottom: 0;
        }

        .stat-progress {
          display: flex;
          overflow: hidden;
          border-radius: 999px;
          background: var(--bg3);
          height: 12px;
        }

        .stat-progress-segment {
          height: 100%;
          transition: width 0.25s ease;
        }

        .stat-progress-draft {
          background: linear-gradient(90deg, #46d9ff 0%, #2bb8df 100%);
        }

        .stat-progress-other {
          background: linear-gradient(90deg, #6f95ff 0%, #f5af28 100%);
        }

        .stat-breakdown-note {
          font-size: 12px;
          color: var(--text2);
        }

        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stat-card {
          animation: countUp 1.2s ease-out forwards;
        }

        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.4s; }

        .content-section {
          margin-bottom: 80px;
          scroll-margin-top: calc(84px + var(--support-banner-height, 0px));
        }

        .content-section > h2,
        .content-section > h3 {
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
        }

        .content-section > h2 {
          margin-bottom: 24px;
          color: var(--text);
        }

        .content-section > h3 {
          margin-top: 32px;
          margin-bottom: 16px;
          color: var(--text);
          scroll-margin-top: calc(84px + var(--support-banner-height, 0px));
        }

        .content-section p {
          color: var(--text2);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .explore-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 20px;
        }

        .explore-card {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 18px;
          min-height: 168px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .explore-card-kicker {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          border-radius: 999px;
          border: 1px solid rgba(54, 211, 153, 0.18);
          background: rgba(16, 185, 129, 0.08);
          color: var(--accent);
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 9px;
        }

        .explore-card h3 {
          margin: 0;
          font-size: 20px;
          line-height: 1.1;
        }

        .explore-card p {
          margin-bottom: 0;
          max-width: 56ch;
        }

        .explore-card-note {
          margin-top: auto;
          font-size: 12px;
          color: var(--text2);
          border-top: 1px solid var(--border);
          padding-top: 10px;
        }

        @media (max-width: 760px) {
          .explore-grid {
            grid-template-columns: 1fr;
          }
        }

        .analytics-playbook {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 18px;
        }

        .analytics-card {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 18px;
          display: grid;
          gap: 10px;
        }

        .analytics-card-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          border: 1px solid rgba(54, 211, 153, 0.22);
          background: rgba(16, 185, 129, 0.09);
          color: var(--accent);
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 9px;
        }

        .analytics-card h3 {
          margin: 0;
          font-size: 21px;
        }

        .analytics-card p {
          margin-bottom: 0;
        }

        .analytics-card-block {
          background-color: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 13px;
        }

        .analytics-card-block h4 {
          margin: 0 0 7px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--text2);
        }

        .analytics-list {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 5px;
          color: var(--text2);
          font-size: 13px;
          line-height: 1.45;
        }

        .analytics-role-grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .analytics-role-item {
          background-color: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px;
        }

        .analytics-role-item h3 {
          margin: 0 0 6px;
          font-size: 16px;
        }

        .analytics-role-item p {
          margin-bottom: 0;
          font-size: 13px;
          color: var(--text2);
        }

        .insights-playbook {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          margin-top: 18px;
        }

        .insights-card {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px;
          display: grid;
          gap: 12px;
        }

        .insights-card-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          border: 1px solid rgba(54, 211, 153, 0.22);
          background: rgba(16, 185, 129, 0.09);
          color: var(--accent);
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 9px;
        }

        .insights-card h3 {
          margin: 0;
          font-size: 20px;
        }

        .insights-card p {
          margin-bottom: 0;
        }

        .insights-card-block {
          background-color: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 13px;
        }

        .insights-card-block h4 {
          margin: 0 0 7px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--text2);

        .insights-label-toggle {
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--bg2);
          overflow: hidden;
        }

        .insights-label-toggle summary {
          list-style: none;
          cursor: pointer;
          padding: 10px 12px;
          color: var(--text2);
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }

        .insights-label-toggle summary::-webkit-details-marker {
          display: none;
        }

        .insights-label-toggle summary::after {
          content: 'Hide label';
          float: right;
          color: var(--accent);
        }

        .insights-label-toggle:not([open]) summary::after {
          content: 'Show label';
        }

        .insights-label-toggle img {
          display: block;
          width: 100%;
        }
        }

        .insights-list {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 5px;
          color: var(--text2);
          font-size: 13px;
          line-height: 1.45;
        }

        @media (max-width: 1060px) {
          .analytics-playbook {
            grid-template-columns: 1fr;
          }

          .analytics-role-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

        }

        @media (max-width: 700px) {
          .analytics-role-grid {
            grid-template-columns: 1fr;
          }
        }

        .upgrade-layout {
          display: grid;
          gap: 18px;
          margin-top: 18px;
        }

        .upgrade-figure {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px;
          overflow: hidden;
        }

        .upgrade-image {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 12px;
          background: #fff;
        }

        .upgrade-caption {
          margin-top: 12px;
          font-size: 13px;
          color: var(--text2);
        }

        .upgrade-panel {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 22px;
        }

        .upgrade-top-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .upgrade-top-card {
          background-color: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
        }

        .upgrade-top-card h4 {
          margin: 0 0 8px;
          font-size: 14px;
        }

        .upgrade-top-card p {
          margin: 0;
          font-size: 13px;
        }

        .upgrade-flow {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .upgrade-stage {
          background-color: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 12px;
          text-align: center;
          font-size: 12px;
          color: var(--text2);
          font-weight: 600;
        }

        .upgrade-stage.active {
          color: var(--text);
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--green-glow) inset;
        }

        .upgrade-guide {
          margin-top: 6px;
        }

        .upgrade-guide-steps {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .upgrade-step {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .upgrade-step summary {
          list-style: none;
          cursor: pointer;
          padding: 14px 16px;
          font-weight: 700;
          color: var(--text);
          position: relative;
        }

        .upgrade-step summary::-webkit-details-marker {
          display: none;
        }

        .upgrade-step summary::after {
          content: '+';
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text2);
          font-size: 18px;
          line-height: 1;
        }

        .upgrade-step[open] summary::after {
          content: '-';
          color: var(--accent);
        }

        .upgrade-step-content {
          padding: 0 16px 14px;
          border-top: 1px solid var(--border);
        }

        .upgrade-step-content p {
          margin: 10px 0 0;
        }

        .upgrade-list {
          display: grid;
          gap: 12px;
          margin-top: 18px;
        }

        .upgrade-list-item {
          background-color: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
        }

        .upgrade-list-item h4 {
          margin-bottom: 6px;
          font-size: 15px;
        }

        .upgrade-list-item p {
          margin-bottom: 0;
        }

        @media (max-width: 960px) {
          .upgrade-top-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .upgrade-flow {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .about-intro {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 32px;
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          padding: 5px 11px;
          border-radius: 999px;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .about-title {
          max-width: 980px;
          font-size: clamp(36px, 4.2vw, 58px);
          line-height: 1.05;
          margin-bottom: 14px;
        }

        .about-summary {
          max-width: 920px;
          font-size: 18px;
          color: var(--text2);
          margin-bottom: 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
        }

        .info-card {
          background-color: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          min-height: 120px;
        }

        .info-card-kicker {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text2);
          margin-bottom: 12px;
        }

        .info-card p {
          margin-bottom: 0;
          color: var(--text);
          line-height: 1.5;
        }

        .about-panels {
          display: grid;
          grid-template-columns: 1.2fr 0.95fr;
          gap: 18px;
          margin-top: 28px;
        }

        .about-panel {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }

        .about-panel h3 {
          margin-top: 0;
          margin-bottom: 12px;
        }

        .about-panel p {
          margin-bottom: 14px;
        }

        .use-list {
          display: grid;
          gap: 12px;
        }

        .use-item {
          background-color: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
        }

        .use-item h4 {
          margin-bottom: 6px;
          font-size: 15px;
        }

        .use-item p {
          margin-bottom: 0;
        }

        @media (max-width: 960px) {
          .info-grid,
          .about-panels {
            grid-template-columns: 1fr;
          }
        }

        .content-section a {
          color: var(--accent);
          text-decoration: none;
          transition: opacity 0.3s ease;
        }

        .content-section a:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .code-block {
          background-color: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 16px;
          margin: 16px 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: var(--text2);
          overflow-x: auto;
          line-height: 1.5;
        }

        .card-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin: 24px 0;
        }

        .card {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          padding: 20px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .card:hover {
          background-color: var(--bg3);
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        .card h4 {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text);
        }

        .card p {
          font-size: 13px;
          color: var(--text2);
          margin-bottom: 0;
        }

        .faq-intro {
          color: var(--text2);
          max-width: 760px;
          margin-bottom: 24px;
        }

        .faq-group {
          margin-bottom: 34px;
        }

        .faq-kicker {
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 11px;
          color: var(--text2);
          margin-bottom: 8px;
        }

        .faq-group-title {
          margin-top: 0;
          margin-bottom: 14px;
        }

        .faq-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .faq-item {
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }

        .faq-item summary {
          list-style: none;
          cursor: pointer;
          padding: 14px 16px;
          font-weight: 700;
          color: var(--text);
          position: relative;
        }

        .faq-item summary::-webkit-details-marker {
          display: none;
        }

        .faq-item summary::after {
          content: '+';
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text2);
          font-size: 18px;
          line-height: 1;
        }

        .faq-item[open] summary::after {
          content: '-';
          color: var(--accent);
        }

        .faq-answer {
          padding: 0 16px 16px;
          color: var(--text2);
          line-height: 1.65;
          border-top: 1px solid var(--border);
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: var(--bg);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--text2);
        }
      `}</style>

      {/* LOADER */}
      <div className={`loader ${!isLoaderVisible ? 'hidden' : ''}`}>
        <div className="loader-logo">
          <span className="loader-logo-accent">docs</span>
          <span>.EIPsInsight</span>
        </div>
        <div className="loader-bar">
          <div className="loader-bar-fill"></div>
        </div>
        <div className="loader-text">
          <div className="loader-text-item">Indexing proposals...</div>
          <div className="loader-text-item">Loading governance data...</div>
          <div className="loader-text-item">Ready.</div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div
        style={{
          opacity: isLoaderVisible ? 0 : 1,
          transition: 'opacity 0.5s ease',
          ['--support-banner-height' as any]: showSupportBanner ? '36px' : '0px',
        } as CSSProperties}
      >
        {showSupportBanner ? (
          <div className="support-banner" role="status" aria-label="Support EIPsInsight on Giveth">
            <span>Public goods infrastructure for Ethereum governance. Support us on</span>
            <a href="https://giveth.io/project/eipsinsight" target="_blank" rel="noreferrer" className="support-banner-link">
              Giveth QF
            </a>
            <span>💜</span>
            <button
              type="button"
              className="support-banner-close"
              aria-label="Dismiss support banner"
              onClick={() => setShowSupportBanner(false)}
            >
              ×
            </button>
          </div>
        ) : null}
        {/* NAVBAR */}
        <nav className="navbar" id="navbar">
         <div className="navbar-left">
  <img 
    src="/EIPsInsights.gif" 
    alt="" 
    style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} 
  />
  <span>
    <span style={{ color: 'var(--accent)' }}>docs</span>
    <span style={{ color: 'var(--text)' }}>.EIPsInsight</span>
  </span>
</div>
          <div className="navbar-center">
            <a href="#home">Home</a>
            <a href="#standards">Standards</a>
            <a href="#upgrades">Upgrades</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="navbar-right">
            <Link href="https://github.com/AvarchLLC/eipsinsight-v4" target="_blank" className="navbar-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </Link>
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>

        {/* SIDEBAR */}
        <aside className="sidebar">
          {navSections.map((section, index) => (
            <div key={section.id} className="sidebar-section">
              {(index === 0 || section.group !== navSections[index - 1].group) ? (
                <div className="sidebar-group-label">{section.group}</div>
              ) : null}
              <div
                className={`sidebar-section-title ${activeSectionId === section.id ? 'active' : ''}`}
                onClick={() => {
                  toggleSection(section.id);
                }}
              >
                <span>{section.label}</span>
                <span className={`sidebar-chevron ${expandedSections[section.id as keyof typeof expandedSections] ? 'expanded' : ''}`}>›</span>
              </div>
              <div className={`sidebar-items ${!expandedSections[section.id as keyof typeof expandedSections] ? 'collapsed' : ''}`}>
                {section.items.map((item, idx) => (
                  <button
                    key={idx}
                    className={`sidebar-item ${activeItemId === item.sectionId ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSectionId(section.id);
                      setActiveItemId(item.sectionId);
                      scrollToSection(item.sectionId);
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-container">
          <div className="main-inner">
          {/* HERO */}
          <section className="hero" id="home">
            <div className="hero-eyebrow">Documentation Hub</div>
            <h1>
              Track Ethereum Proposals <br />
              and <span className="accent">Governance</span>
            </h1>
            <p className="hero-subtitle">
              Real-time documentation for proposal lifecycle, upgrade progress, and editorial activity across EIPs, ERCs, and RIPs, with structured guides and references for contributors and developers.
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary">Get Started →</button>
              <a href="https://github.com/AvarchLLC/eipsinsight-v4" target="_blank" rel="noreferrer" className="btn btn-secondary">View on GitHub</a>
            </div>

            {/* STATS */}
            <div className="stats">
              <div className="stat-card">
                <div className="stat-card-header">
                  <div>
                    <div className="stat-kicker">EIPs Indexed</div>
                    <div className="stat-label">Complete standards archive</div>
                  </div>
                </div>
                <div className="stat-number">1,152</div>
                <div className="stat-breakdown-note">All tracked standards across the docs hub</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <div>
                    <div className="stat-kicker">Active Upgrades</div>
                    <div className="stat-label">Current upgrade windows</div>
                  </div>
                </div>
                <div className="stat-number">12</div>
                <div className="stat-breakdown-note">Coordinated network changes in flight</div>
              </div>
              <HoverCard openDelay={120} closeDelay={80}>
                <HoverCardTrigger asChild>
                  <div className="stat-card stat-card-active">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-kicker">Active Proposals</div>
                        <div className="stat-label">Hover for breakdown</div>
                      </div>
                      <span className="stat-live-pill">LIVE</span>
                    </div>
                    <div className="stat-number stat-number-active">1,152</div>
                    <div className="stat-progress" aria-hidden="true">
                      <span
                        className="stat-progress-segment stat-progress-draft"
                        style={{ width: `${(activeProposalsDraft / activeProposalsTotal) * 100}%` }}
                      />
                      <span
                        className="stat-progress-segment stat-progress-other"
                        style={{ width: `${(activeProposalsOther / activeProposalsTotal) * 100}%` }}
                      />
                    </div>
                    <div className="stat-breakdown-note">Draft 349 · Other active states 803</div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 border border-border bg-(--bg2) text-(--text) shadow-xl">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-(--text2)">Active proposals</div>
                      <div className="mt-1 text-2xl font-semibold text-accent">1,152 total</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md border border-border bg-(--bg) px-3 py-2">
                        <span className="text-sm text-(--text2)">Draft</span>
                        <span className="text-sm font-semibold text-(--text)">349</span>
                      </div>
                      <div className="flex items-center justify-between rounded-md border border-border bg-(--bg) px-3 py-2">
                        <span className="text-sm text-(--text2)">Other active states</span>
                        <span className="text-sm font-semibold text-(--text)">{activeProposalsOther}</span>
                      </div>
                    </div>
                    <p className="text-xs leading-5 text-(--text2)">
                      The remainder covers non-draft active proposals such as review and Last Call work.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </section>

          <section className="content-section" id="about-us" aria-labelledby="about-overview" data-section="about" itemScope itemType="https://schema.org/WebPageElement">
            <div className="about-intro" id="about-overview">
              <div className="section-label">About</div>
              <h2 className="about-title">EIPInsight turns Ethereum standards activity into something people can actually navigate.</h2>
              <p className="about-summary">
                We build an operational view of EIPs, ERCs, RIPs, proposal workflows, and governance movement so builders, editors, researchers, and newcomers can understand what is changing and why.
              </p>

              <div className="info-grid">
                <div className="info-card">
                  <div className="info-card-kicker">Mission</div>
                  <p>Make Ethereum standards and governance legible, explorable, and operationally useful.</p>
                </div>
                <div className="info-card">
                  <div className="info-card-kicker">What We Track</div>
                  <p>EIPs, ERCs, RIPs, PR activity, editor workflows, contributor graphs, and status transitions.</p>
                </div>
                <div className="info-card">
                  <div className="info-card-kicker">Why It Exists</div>
                  <p>Because governance data is public, but still too fragmented for most people to work with efficiently.</p>
                </div>
                <div className="info-card">
                  <div className="info-card-kicker">Built By</div>
                  <p>Avarch with support from the Ethereum ecosystem and partners close to standards operations.</p>
                </div>
              </div>
            </div>

            <div className="about-panels">
              <div className="about-panel" id="why-we-built-this">
                <div className="section-label">Why We Built This</div>
                <h3>Standards and governance should not require institutional memory to follow.</h3>
                <p>
                  Ethereum governance happens across repositories, pull requests, review queues, forum threads, upgrades, and informal coordination. The data is public, but the workflow is still hard to inspect as a system.
                </p>
                <p>
                  EIPInsight exists to reduce that gap. We aggregate the moving parts, normalize them into product surfaces, and help people answer practical questions: what changed, what is stuck, who is active, what upgrade work depends on what, and where to go next.
                </p>
                <p>
                  The goal is not just more charts. The goal is operational clarity for anyone trying to understand or participate in Ethereum standards.
                </p>
              </div>

              <div className="about-panel" id="how-people-use-it">
                <div className="section-label">How People Use It</div>
                <h3>From reading standards to working with them.</h3>
                <div className="use-list">
                  <div className="use-item">
                    <h4>Search and discovery</h4>
                    <p>Search proposals, people, and governance events with structured filters instead of manual repository digging.</p>
                  </div>
                  <div className="use-item">
                    <h4>Analytics and monitoring</h4>
                    <p>Track lifecycle movement, editorial load, PR activity, and standards composition through dashboards and timelines.</p>
                  </div>
                  <div className="use-item">
                    <h4>Workflow tooling</h4>
                    <p>Use boards, dependency maps, builder, and explorer views to move from reading governance to working with it.</p>
                  </div>
                  <div className="use-item">
                    <h4>Context and commentary</h4>
                    <p>Pair raw data with commentary, docs, videos, and news so the platform stays useful for both learning and operations.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STANDARDS */}
          <section className="content-section" id="standards" aria-labelledby="standards-overview" data-section="standards" itemScope itemType="https://schema.org/WebPageElement">
            <h2 id="standards-overview">Standards & Proposals</h2>

            <h3 id="eips-explained">EIPs Explained</h3>
            <p>
              EIPs are the primary mechanism for proposing changes to the Ethereum protocol. They follow a standardized process from initial discussion through community review to final implementation.
            </p>
            <div className="code-block">
{`// Example: EIP-1559 (Fee Market Change)
{
  "number": 1559,
  "title": "Fee market change for ETH 2.0 compatibility",
  "status": "Final",
  "type": "Standards Track",
  "category": "Core"
}`}
            </div>

            <h3 id="ercs-explained">ERCs Explained</h3>
            <p>
              ERCs define standards for tokens and smart contract interfaces. The most well-known is ERC-20 (fungible tokens), but there are many others including ERC-721 (NFTs) and ERC-1155 (multi-token standard).
            </p>

            <h3 id="rips-explained">RIPs Explained</h3>
            <p>
              RIPs provide a standardized way to propose and discuss improvements to rollup solutions and scaling solutions built on Ethereum.
            </p>

            <img
              src="/eipsinsighthomepage_label.png"
              alt="EIPsInsight homepage label"
              style={{
                width: '100%',
                maxWidth: '1120px',
                display: 'block',
                margin: '18px auto 24px',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--bg2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
              }}
            />

            <h3 id="proposal-lifecycle">Proposal Lifecycle</h3>
            <div className="card-list">
              <div className="card">
                <h4>📋 Idea</h4>
                <p>Initial discussion and feedback gathering from the community</p>
              </div>
              <div className="card">
                <h4>✍️ Draft</h4>
                <p>Formal proposal writing with specification details</p>
              </div>
              <div className="card">
                <h4>🔍 Review</h4>
                <p>Community and core developer review and feedback</p>
              </div>
              <div className="card">
                <h4>✅ Final</h4>
                <p>Accepted and ready for implementation</p>
              </div>
            </div>
          </section>

          {/* EXPLORE */}
          <section className="content-section" id="explore" aria-labelledby="explore-hub" data-section="explore" itemScope itemType="https://schema.org/WebPageElement">
            <h2 id="explore-hub">Explore</h2>
            <p>
              Explore views turn the standards feed into focused lenses, helping you spot spikes, stalls, ownership patterns, and category shifts without digging through raw lists.
            </p>

            <div className="explore-grid">
              <article className="explore-card" id="explore-by-year">
                <div className="explore-card-kicker">By Year</div>
                <h3>Watch the timeline breathe.</h3>
                <p>
                  Compare proposal traffic year by year to find active eras, quiet stretches, and the moments when standards work picked up speed.
                </p>
                <div className="explore-card-note">Best for spotting long-term cycles and release-era surges.</div>
              </article>

              <article className="explore-card" id="explore-by-status">
                <div className="explore-card-kicker">By Status</div>
                <h3>See where work is moving.</h3>
                <p>
                  Track Draft, Review, Last Call, Final, and Deferred states as a funnel so you can instantly see what is progressing and what needs attention.
                </p>
                <div className="explore-card-note">Best for triage, bottleneck hunting, and progress checks.</div>
              </article>

              <article className="explore-card" id="explore-by-role">
                <div className="explore-card-kicker">By Role</div>
                <h3>Map the people behind each change.</h3>
                <p>
                  Follow authors, editors, reviewers, and implementers to understand who is shaping the proposal, who is reviewing it, and where responsibility sits.
                </p>
                <div className="explore-card-note">Best for ownership, collaboration, and workload visibility.</div>
              </article>

              <article className="explore-card" id="explore-by-category">
                <div className="explore-card-kicker">By Category</div>
                <h3>Compare what kind of work it is.</h3>
                <p>
                  Group standards by category to separate Core work from ERCs, interfaces, and other tracks so the mix of proposal types stays easy to read.
                </p>
                <div className="explore-card-note">Best for understanding where the pipeline is concentrated.</div>
              </article>
            </div>
          </section>

          {/* UPGRADES */}
          <section className="content-section" id="upgrades" aria-labelledby="upgrades-overview" data-section="upgrades" itemScope itemType="https://schema.org/WebPageElement">
            <h2 id="upgrades-overview">Upgrade Watch</h2>
            <p>
              Follow how Ethereum upgrades move from proposals into coordinated network change. This section ties together EIP inclusion, client readiness, and the major milestones that shape each upgrade cycle.
            </p>

            <div className="upgrade-layout">
              <div className="upgrade-panel" id="what-is-upgrade-watch">
                <div className="section-label">Upgrade Features</div>
                <div className="upgrade-top-grid">
                  <div className="upgrade-top-card">
                    <h4>Upgrade sequence</h4>
                    <p>Follow previous upgrades, current focus, and next planned fork windows in one row.</p>
                  </div>
                  <div className="upgrade-top-card">
                    <h4>EIP composition</h4>
                    <p>Inspect how included, soft-frozen, deferred, and dropped EIPs evolve across checkpoints.</p>
                  </div>
                  <div className="upgrade-top-card">
                    <h4>Author and editor context</h4>
                    <p>See who authored and reviewed key proposals to understand ownership and bottlenecks.</p>
                  </div>
                  <div className="upgrade-top-card">
                    <h4>Readiness tracking</h4>
                    <p>Monitor readiness signals before activation so teams can plan releases and audits.</p>
                  </div>
                </div>

                <div className="upgrade-flow">
                  <div className="upgrade-stage">Previous Upgrades</div>
                  <div className="upgrade-stage">Pectra</div>
                  <div className="upgrade-stage">Fusaka</div>
                  <div className="upgrade-stage active">Glamsterdam</div>
                  <div className="upgrade-stage">Hegota</div>
                  <div className="upgrade-stage">Next TBD</div>
                </div>
              </div>

              <figure className="upgrade-figure">
                <img
                  src="/ethupgradetimeline.png"
                  alt="Ethereum network upgrade timeline showing major milestones from Frontier through Glamsterdam"
                  className="upgrade-image"
                />
                <figcaption className="upgrade-caption">
                  Ethereum upgrade timeline across execution and consensus milestones. This image is shown full-width for clear reading.
                </figcaption>
              </figure>

              <div className="upgrade-panel upgrade-guide" id="reading-the-timeline">
                <div className="section-label">How to Read Upgrades</div>
                <h3>Step-by-step: read upgrades properly</h3>
                <p>
                  Start from the timeline row, then drill into EIP composition and status transitions. Use this order to quickly understand what changed, why it changed, and what is likely to ship next.
                </p>

                <div className="upgrade-guide-steps">
                  <details className="upgrade-step" open>
                    <summary>Step 1: Identify the upgrade window</summary>
                    <div className="upgrade-step-content">
                      <p>Find the target upgrade (for example Glamsterdam) and note its position between previous and upcoming forks. This gives you immediate release context.</p>
                    </div>
                  </details>

                  <details className="upgrade-step">
                    <summary>Step 2: Read timeline milestones left to right</summary>
                    <div className="upgrade-step-content">
                      <p>Track milestones chronologically to understand dependency order. Earlier milestones usually represent prerequisites for later activation decisions.</p>
                    </div>
                  </details>

                  <details className="upgrade-step">
                    <summary>Step 3: Check EIP status composition</summary>
                    <div className="upgrade-step-content">
                      <p>Review included, review, blocked, deferred, and removed groups. This tells you what is stable versus still moving in governance discussions.</p>
                    </div>
                  </details>

                  <details className="upgrade-step">
                    <summary>Step 4: Verify execution and consensus impact</summary>
                    <div className="upgrade-step-content">
                      <p>Map each major EIP to execution-layer, consensus-layer, or cross-layer behavior so implementation teams can estimate testing scope and risk.</p>
                    </div>
                  </details>

                  <details className="upgrade-step">
                    <summary>Step 5: Watch readiness and movement weekly</summary>
                    <div className="upgrade-step-content">
                      <p>Compare weekly snapshots to detect movement in EIP buckets. A shift from review to included is usually the strongest signal of likely inclusion.</p>
                    </div>
                  </details>
                </div>

                <div className="upgrade-list">
                  <div className="upgrade-list-item">
                    <h4>What to monitor first</h4>
                    <p>Included EIP count, blocked proposals, and editor comments are the fastest indicators of upgrade health.</p>
                  </div>
                  <div className="upgrade-list-item">
                    <h4>When to dig deeper</h4>
                    <p>If an upgrade row stalls, inspect PR activity and unresolved review notes before assuming timeline slips.</p>
                  </div>
                  <div className="upgrade-list-item">
                    <h4>How this helps teams</h4>
                    <p>Developers, researchers, and operators can align implementation and communication plans using the same source of truth.</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 id="upcoming-glamsterdam">Upcoming: Glamsterdam</h3>
            <p>
              EIPInsight uses the upgrade timeline to keep the next phase of Ethereum visible, from current standards work through the proposals expected to land in Glamsterdam and beyond.
            </p>
          </section>

          {/* ANALYTICS */}
          <section className="content-section" id="analytics" aria-labelledby="analytics-overview" data-section="analytics" itemScope itemType="https://schema.org/WebPageElement">
            <img
              src="/glamsterdam_label.png"
              alt="Glamsterdam label"
              style={{
                width: '100%',
                maxWidth: '1120px',
                display: 'block',
                margin: '18px auto 24px',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--bg2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
              }}
            />
            <h2 id="analytics-overview">Analytics</h2>
            <p>
              Analytics is designed for decision making, not just reporting. Use the guides below to understand what each view is for, which controls matter most, and how to read the visuals correctly.
            </p>

            <div className="analytics-playbook">
              <article className="analytics-card" id="analytics-eips">
                <div className="analytics-card-kicker">EIPs Analytics</div>
                <h3>Use this to read proposal health.</h3>
                <p>Start here when you need a top-level pulse on standards flow, backlog risk, and which proposal categories are dominating the system.</p>
                <div className="analytics-card-block">
                  <h4>Key features</h4>
                  <ul className="analytics-list">
                    <li>Governance health cards for active, stalled, and largest-status-group signals.</li>
                    <li>Pipeline status bars for Draft, Review, Last Call, Final, and stalled buckets.</li>
                    <li>Proposal composition donut to compare Core, ERC, and smaller tracks quickly.</li>
                    <li>Status transition flow for tracking where proposals move next.</li>
                  </ul>
                </div>
                <div className="analytics-card-block">
                  <h4>How to read properly</h4>
                  <ol className="analytics-list">
                    <li>Check stalled versus active first to measure current decision pressure.</li>
                    <li>Read the pipeline bars for bottleneck stage, not only total count.</li>
                    <li>Use composition only as context for the backlog, not as success rate.</li>
                    <li>Confirm with transition flow before concluding momentum changed.</li>
                  </ol>
                </div>
              </article>

              <article className="analytics-card" id="analytics-prs">
                <div className="analytics-card-kicker">PR Analytics</div>
                <h3>Use this to monitor delivery pace.</h3>
                <p>This view shows how quickly work enters and exits review. It is best for spotting merge slowdowns, seasonal load, and review throughput changes.</p>
                <div className="analytics-card-block">
                  <h4>Key features</h4>
                  <ul className="analytics-list">
                    <li>Open, created, merged, and closed counters for current context month.</li>
                    <li>Monthly trend chart combining created and merged bars with open-PR line.</li>
                    <li>Category breakdown by process and participant state.</li>
                    <li>Time-range and repository filters to isolate a specific scope.</li>
                  </ul>
                </div>
                <div className="analytics-card-block">
                  <h4>How to read properly</h4>
                  <ol className="analytics-list">
                    <li>Compare created versus merged in the same period before reading backlog.</li>
                    <li>Use open line trend to detect accumulation, not one-off spikes.</li>
                    <li>Cross-check category bars to see where waiting time is concentrated.</li>
                    <li>Change repo filter to confirm whether the pattern is global or local.</li>
                  </ol>
                </div>
              </article>

              <article className="analytics-card" id="analytics-issues">
                <div className="analytics-card-kicker">Issues Analytics</div>
                <h3>Use this to track blockers and support load.</h3>
                <p>The Issues page helps you inspect unresolved friction, recurring labels, and where open problem volume may slow standards progress.</p>
                <div className="analytics-card-block">
                  <h4>Key features</h4>
                  <ul className="analytics-list">
                    <li>Open and active counters for fast issue-pressure checks.</li>
                    <li>Monthly trend chart for created, closed, and open end-of-month trajectory.</li>
                    <li>Label distribution chart to identify recurring problem types.</li>
                    <li>Open-issues table with repo, author, and comments for triage.</li>
                  </ul>
                </div>
                <div className="analytics-card-block">
                  <h4>How to read properly</h4>
                  <ol className="analytics-list">
                    <li>Watch open end-of-month trend first to see if debt is compounding.</li>
                    <li>Use label distribution to prioritize issue classes, not individual tickets.</li>
                    <li>Then drill into the table for owner and repo-specific action.</li>
                    <li>Recheck after filter changes to avoid overfitting a single repository.</li>
                  </ol>
                </div>
              </article>

              <article className="analytics-card" id="analytics-board">
                <div className="analytics-card-kicker">Board View</div>
                <h3>Use this to execute day-to-day triage.</h3>
                <p>The board is your operational workspace for selecting exact PR subsets and moving from dashboard insight to concrete follow-up actions.</p>
                <div className="analytics-card-block">
                  <h4>Key features</h4>
                  <ul className="analytics-list">
                    <li>Search plus multi-select filters by status, process type, and track.</li>
                    <li>Stackable filter chips for precise working sets.</li>
                    <li>Table view with author, wait time, process, labels, and open status.</li>
                    <li>Export actions for CSV, markdown, and direct link sharing.</li>
                  </ul>
                </div>
                <div className="analytics-card-block">
                  <h4>How to read properly</h4>
                  <ol className="analytics-list">
                    <li>Start broad, then narrow with one dimension at a time.</li>
                    <li>Sort by wait and status to surface the most delayed items first.</li>
                    <li>Use labels as context after selecting process and status scope.</li>
                    <li>Save and share filtered links for repeat weekly reviews.</li>
                  </ol>
                </div>
              </article>
            </div>

            <div className="analytics-role-grid">
              <article className="analytics-role-item" id="analytics-editors">
                <h3>Editors</h3>
                <p>Track editorial throughput, response time, and concentration of review ownership.</p>
              </article>
              <article className="analytics-role-item" id="analytics-reviewers">
                <h3>Reviewers</h3>
                <p>Measure reviewer cycles, leaderboard balance, and review latency distribution.</p>
              </article>
              <article className="analytics-role-item" id="analytics-authors">
                <h3>Authors</h3>
                <p>Understand repeat versus new author mix and proposal outcome patterns.</p>
              </article>
              <article className="analytics-role-item" id="analytics-contributors">
                <h3>Contributors</h3>
                <p>Read contribution heatmaps and activity types to detect participation trends.</p>
              </article>
            </div>
          </section>

          {/* INSIGHTS */}
          <section className="content-section" id="insights" aria-labelledby="insights-overview" data-section="insights" itemScope itemType="https://schema.org/WebPageElement">
            <h2 id="insights-overview">Insights</h2>
            <p>
              Insights helps you move from metrics to interpretation. Each module below explains how to use the view, what controls matter, and how to read outcomes without misinterpreting short-term noise.
            </p>

            <div className="insights-playbook">
              <article className="insights-card" id="insights-year-month">
                <details className="insights-label-toggle" open>
                  <summary>Monthly Insight Label</summary>
                  <img src="/monthly-insight_label.png" alt="Monthly insight label" />
                </details>
                <div className="insights-card-kicker">Year-Month Analysis</div>
                <h3>Track how governance changes month to month.</h3>
                <p>Use this when you want trend direction: whether proposal flow is accelerating, slowing down, or rotating between EIP, ERC, and RIP tracks.</p>
                <div className="insights-card-block">
                  <h4>Main features</h4>
                  <ul className="insights-list">
                    <li>Status transition summary by standards type for a chosen month.</li>
                    <li>Change-mix donut to split status, content, and metadata movement.</li>
                    <li>Editorial activity leaderboard showing who touched the most proposals.</li>
                    <li>Draft-vs-Final history line to compare early-stage versus finalized output.</li>
                  </ul>
                </div>
                <div className="insights-card-block">
                  <h4>How to read it properly</h4>
                  <ol className="insights-list">
                    <li>Pick month and repo scope first so all panels share one context.</li>
                    <li>Read status-transition table before the donut to understand what moved.</li>
                    <li>Use leaderboard as participation context, not quality score.</li>
                    <li>Confirm with Draft-vs-Final history to avoid overreacting to one month.</li>
                  </ol>
                </div>
              </article>

              <article className="insights-card" id="insights-governance-process">
                <details className="insights-label-toggle" open>
                  <summary>Governance Label</summary>
                  <img src="/Governance_label.png" alt="Governance label" />
                </details>
                <div className="insights-card-kicker">Governance & Process</div>
                <h3>Measure process speed and friction.</h3>
                <p>This view is your operational health report: it shows decision speed, process stage conversion, and where waiting states are accumulating.</p>
                <div className="insights-card-block">
                  <h4>Main features</h4>
                  <ul className="insights-list">
                    <li>Open pipeline, merge rate, median decision time, and stalled counts.</li>
                    <li>Process flow bars from opened to reviewed, merged, and closed.</li>
                    <li>Current governance state panel with waiting-on-author/editor splits.</li>
                    <li>Decision speed table by repo for quick benchmark comparison.</li>
                  </ul>
                </div>
                <div className="insights-card-block">
                  <h4>How to read it properly</h4>
                  <ol className="insights-list">
                    <li>Start with merge rate plus median decision time as the core health pair.</li>
                    <li>Use process flow conversion rates to spot stage-by-stage drop-off.</li>
                    <li>Check governance state legend to identify whether delays are author- or editor-side.</li>
                    <li>Compare EIPs and ERCs in the decision-speed table before escalating conclusions.</li>
                  </ol>
                </div>
              </article>

              <article className="insights-card" id="insights-editorial-commentary">
                <details className="insights-label-toggle" open>
                  <summary>Editorial Commentary Label</summary>
                  <img src="/editorial_commentory_label.png" alt="Editorial commentary label" />
                </details>
                <div className="insights-card-kicker">Editorial Commentary</div>
                <h3>Generate lifecycle intelligence for a proposal.</h3>
                <p>Use this module for a deep read on one proposal. It converts raw status history and PR context into an editor-style narrative of momentum and risk.</p>
                <div className="insights-card-block">
                  <h4>Main features</h4>
                  <ul className="insights-list">
                    <li>Proposal search (EIP, ERC, or RIP) with direct lifecycle analysis trigger.</li>
                    <li>Narrative summary of stage durations, transition cadence, and churn.</li>
                    <li>Context cues for PR activity intensity and likely readiness signals.</li>
                    <li>Focused single-proposal lens for review calls and contributor alignment.</li>
                  </ul>
                </div>
                <div className="insights-card-block">
                  <h4>How to read it properly</h4>
                  <ol className="insights-list">
                    <li>Search a specific proposal, then read stage durations before commentary tone.</li>
                    <li>Treat churn markers as risk indicators, not automatic blockers.</li>
                    <li>Cross-reference PR intensity with current status to judge real readiness.</li>
                    <li>Use the report to prepare review notes and next-step ownership.</li>
                  </ol>
                </div>
              </article>
            </div>
          </section>

          {/* TOOLS */}
          <section className="content-section" id="tools" aria-labelledby="tools-overview" data-section="tools" itemScope itemType="https://schema.org/WebPageElement">
            <h2 id="tools-overview">Tools</h2>
            <p>
              Productivity tools support day-to-day standards operations, from drafting proposals to tracking dependencies and upgrade windows.
            </p>
            <h3 id="tools-eip-builder">EIP Builder</h3>
            <p>Use guided templates and validation hints to draft cleaner proposals faster.</p>
            <h3 id="tools-timeline">Timeline</h3>
            <p>Track changes chronologically with milestone-level context for upgrades and proposal states.</p>
          </section>

          {/* FAQ */}
          <section className="content-section" id="faq" aria-labelledby="faq-overview" data-section="faq" itemScope itemType="https://schema.org/WebPageElement">
            <h2 id="faq-overview">FAQ</h2>

            <p className="faq-intro">
              Quick answers about standards, governance workflow, and how the platform works.
            </p>

            {faqGroups.map((group) => (
              <div key={group.sectionId} className="faq-group">
                <div className="faq-kicker">{group.kicker}</div>
                <h3 className="faq-group-title" id={group.sectionId}>{group.title}</h3>
                <div className="faq-stack">
                  {group.items.map((item, idx) => (
                    <details className="faq-item" key={item.question} open={idx === 0}>
                      <summary>{item.question}</summary>
                      <p className="faq-answer">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </section>

          </div>
        </main>
      </div>

      <script>{`
        // Navbar scroll effect
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
          if (window.scrollY > 10) {
            navbar?.classList.add('scrolled');
          } else {
            navbar?.classList.remove('scrolled');
          }
        });
      `}</script>
    </>
  );
}
