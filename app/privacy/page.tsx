import type { Metadata } from "next";
import { PublicDocumentLayout, Section } from "@/components/legal/PublicDocumentLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | 占いThreadsバズ司令塔",
  description: "占いThreadsバズ司令塔のプライバシーポリシー"
};

export default function PrivacyPage() {
  return (
    <PublicDocumentLayout
      title="Privacy Policy"
      description="This privacy policy explains how 占いThreadsバズ司令塔 handles data used for Threads analytics, post planning, scheduling, and reporting."
    >
      <Section title="1. Service Overview">
        <p>
          占いThreadsバズ司令塔 is a private MVP dashboard for analyzing Threads posts in the fortune-telling niche,
          improving post drafts, managing scheduled posts, and reviewing insights. The service is designed as an
          editorial support tool, not as an automated mass-posting or engagement automation tool.
        </p>
      </Section>

      <Section title="2. Data We Process">
        <p>We may process the following data only for operating the dashboard:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Threads account identifier, username, post IDs, post text, timestamps, media type, and public permalink.</li>
          <li>Threads metrics such as views, likes, replies, reposts, and quotes when available through official APIs.</li>
          <li>Keywords, manual imports, post ideas, reservations, safety checks, reports, and operational logs created in the dashboard.</li>
          <li>OAuth authorization results needed to generate or refresh access tokens.</li>
        </ul>
      </Section>

      <Section title="3. How We Use Data">
        <p>Data is used to provide buzz analysis, content improvement suggestions, post scheduling, insight reports, and safety checks.</p>
        <p>
          We do not use the data for automatic likes, automatic follows, automated reply spam, browser scraping, password collection,
          or artificial behavior designed to evade platform restrictions.
        </p>
      </Section>

      <Section title="4. Threads API and Tokens">
        <p>
          Threads API access is performed only through official Meta/Threads APIs. Access tokens and app secrets are stored as server-side
          environment variables and are not exposed in client-side code. Error logs are sanitized so tokens, app secrets, authorization
          headers, and API keys are not saved.
        </p>
      </Section>

      <Section title="5. Sharing and Disclosure">
        <p>
          We do not sell personal data. Data is stored in Supabase and hosted on Vercel for the purpose of operating this private MVP.
          Data may be disclosed only if required by law or necessary to protect the service from abuse.
        </p>
      </Section>

      <Section title="6. Data Retention and Deletion">
        <p>
          Operational data is retained only as long as needed for the dashboard workflow. If a Threads user removes authorization or requests
          deletion, the service provides callback endpoints for deauthorization and data deletion handling.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>For privacy questions or data deletion requests, contact: hikaru630924@gmail.com</p>
      </Section>

      <Section title="8. Last Updated">
        <p>May 17, 2026</p>
      </Section>
    </PublicDocumentLayout>
  );
}
