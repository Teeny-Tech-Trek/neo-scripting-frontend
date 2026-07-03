import {
  LayoutDashboard,
  Layers,
  FileEdit,
  Briefcase,
  Sliders,
  Database,
  History,
  Play,
  User,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** CSS selector of the target element to highlight */
  target: string;
  /** Step title displayed in the tooltip */
  title: string;
  /** Step description displayed in the tooltip */
  description: string;
  /** Preferred placement of the tooltip relative to the target */
  placement: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  /** Optional Lucide icon component */
  icon?: LucideIcon;
  /** Callback fired before this step is shown */
  onBeforeStep?: () => void | Promise<void>;
  /** Callback fired after this step is completed (user clicks Next) */
  onAfterStep?: () => void | Promise<void>;
  /** Spotlight padding override in pixels */
  spotlightPadding?: number;
  /** Condition to determine if the step should be shown */
  condition?: () => boolean;
  /** Custom button text overrides */
  customButtonText?: {
    next?: string;
    prev?: string;
  };
}

export interface TourConfig {
  /** Unique tour identifier for storage */
  tourId: string;
  /** List of steps in the tour */
  steps: TourStep[];
  /** Auto start delay in milliseconds */
  autoStartDelay?: number;
}

// ─────────────────────────────────────────────
// Dashboard Tour Steps
// ─────────────────────────────────────────────

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome-hero',
    target: '#tour-welcome-hero',
    title: 'Welcome to Neo Scripting!',
    description:
      'This is your multi-agent scripting dashboard. Let\'s take a quick tour to see how to research, write, and compile high-quality posts and articles using specialized AI agents.',
    placement: 'bottom',
    icon: LayoutDashboard,
    spotlightPadding: 16,
    customButtonText: { next: "Start Tour →" },
  },
  {
    id: 'view-toggle',
    target: '#tour-view-toggle',
    title: 'Dashboard vs. MCP Server',
    description:
      'Toggle between the Web Dashboard (where you can run content briefs directly) and the MCP Server view (to connect Neo Scripting to developer environments like Cursor or Claude).',
    placement: 'bottom',
    icon: Layers,
    spotlightPadding: 8,
  },
  {
    id: 'brief-topic',
    target: '#tour-brief-topic',
    title: 'What should we write?',
    description:
      'Type your topic, prompt, or title here. Our multi-agent researcher and writer will crawl competitor pages, analyze market trends, and draft the content.',
    placement: 'bottom',
    icon: FileEdit,
    spotlightPadding: 8,
  },
  {
    id: 'brief-brand-url',
    target: '#tour-brief-brand-url',
    title: 'Brand Context',
    description:
      'Provide your Brand Name and Company URL. This grounds the research agent so it understands your market position, competitors, and product context.',
    placement: 'bottom',
    icon: Briefcase,
    spotlightPadding: 12,
  },
  {
    id: 'brief-format',
    target: '#tour-brief-format',
    title: 'Choose Your Format',
    description:
      'Select Long-form for comprehensive articles, or Short-form to generate platform-specific posts for LinkedIn, Twitter, or Reddit.',
    placement: 'bottom',
    icon: Sliders,
    spotlightPadding: 12,
  },
  {
    id: 'advanced-toggle',
    target: '#tour-advanced-toggle',
    title: 'Advanced Customization',
    description:
      'Expand this panel to add mandatory keywords, list direct competitor URLs, or upload local reference documents for the writer agent to reference.',
    placement: 'top',
    icon: Sliders,
    spotlightPadding: 12,
  },
  {
    id: 'sidebar-docs',
    target: '#tour-sidebar-docs',
    title: 'Brand Knowledge Base',
    description:
      'Manage uploaded PDFs, text files, or markdown resources here. You can reference these documents during content generation to ground the writing in your proprietary data.',
    placement: 'right',
    icon: Database,
    spotlightPadding: 10,
  },
  {
    id: 'sidebar-history',
    target: '#tour-sidebar-history',
    title: 'Recent History',
    description:
      'Access your recently generated articles and posts. Click any item to view details, copy raw output, or review the agent execution history.',
    placement: 'right',
    icon: History,
    spotlightPadding: 10,
  },
  {
    id: 'run-btn',
    target: '#tour-run-btn',
    title: 'Run Scripting Agents',
    description:
      'Once your brief is configured, click this button to kick off the multi-agent generation pipeline. It takes about 30–60 seconds for the agents to complete the execution.',
    placement: 'top',
    icon: Play,
    spotlightPadding: 8,
  },
  {
    id: 'user-menu',
    target: '#tour-user-menu',
    title: 'Credits & Settings',
    description:
      'Monitor your remaining balance credits, access account and billing settings, or sign out.',
    placement: 'bottom',
    icon: User,
    spotlightPadding: 12,
    customButtonText: { next: 'Finish 🎉' },
  },
];

export const DASHBOARD_TOUR_CONFIG: TourConfig = {
  tourId: 'neo_dashboard_tour_v1',
  steps: DASHBOARD_TOUR_STEPS,
  autoStartDelay: 1500,
};
