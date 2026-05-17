import type { Metadata } from "next";
import { PublicDocumentLayout, Section } from "@/components/legal/PublicDocumentLayout";

export const metadata: Metadata = {
  title: "App Review Notes | 占いThreadsバズ司令塔",
  description: "Meta App Review向けの機能説明"
};

export default function AppReviewPage() {
  return (
    <PublicDocumentLayout
      title="App Review Notes"
      description="This page explains how 占いThreadsバズ司令塔 uses Threads permissions for Meta App Review."
    >
      <Section title="1. Product Summary">
        <p>
          This app is a private dashboard for managing a fortune-telling themed Threads account. It analyzes public Threads trends,
          generates editorial draft ideas, runs template-risk checks, schedules human-approved posts, collects insights, and creates
          reports for future content improvement.
        </p>
      </Section>

      <Section title="2. Requested Permissions">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>threads_basic:</strong> Identify the connected Threads profile and read basic account information.</li>
          <li><strong>threads_keyword_search:</strong> Search Threads posts by approved fortune-telling keywords for trend analysis.</li>
          <li><strong>threads_content_publish:</strong> Publish only human-approved scheduled posts created in the dashboard.</li>
          <li><strong>threads_manage_insights:</strong> Collect performance metrics for posts published by the connected account.</li>
        </ul>
      </Section>

      <Section title="3. Safety Boundaries">
        <p>
          The app does not automate likes, follows, repeated replies, password-based login, browser scraping, or unnatural behavior.
          Publishing requires human approval, safety checks, and reservation status validation before any post is sent to Threads.
        </p>
      </Section>

      <Section title="4. How Reviewers Can Test">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Open the production app URL and log in with the test credentials provided in the App Review submission.</li>
          <li>Open Settings and run the Threads API connection test.</li>
          <li>Use keyword_search test to verify the search permission when approved.</li>
          <li>Open Buzz to run previous-day collection. If keyword_search is unavailable, the app clearly shows fallback guidance.</li>
          <li>Open Ideas, Reservations, Insights, and Reports to review the human-approval workflow and reporting features.</li>
        </ol>
      </Section>

      <Section title="5. Public URLs">
        <ul className="list-disc space-y-2 pl-6">
          <li>Privacy Policy: https://uranai-threads-dashboard.vercel.app/privacy</li>
          <li>Terms of Use: https://uranai-threads-dashboard.vercel.app/terms</li>
          <li>OAuth Redirect URI: https://uranai-threads-dashboard.vercel.app/api/threads/callback</li>
          <li>Deauthorize Callback: https://uranai-threads-dashboard.vercel.app/api/threads/deauthorize</li>
          <li>Data Deletion Callback: https://uranai-threads-dashboard.vercel.app/api/threads/delete-data</li>
        </ul>
      </Section>
    </PublicDocumentLayout>
  );
}
