import type { Metadata } from "next";
import { PublicDocumentLayout, Section } from "@/components/legal/PublicDocumentLayout";

export const metadata: Metadata = {
  title: "Terms of Use | 占いThreadsバズ司令塔",
  description: "占いThreadsバズ司令塔の利用規約"
};

export default function TermsPage() {
  return (
    <PublicDocumentLayout
      title="Terms of Use"
      description="These terms describe the intended use and safety boundaries of 占いThreadsバズ司令塔."
    >
      <Section title="1. Intended Use">
        <p>
          占いThreadsバズ司令塔 is intended for private editorial management of a Threads account in the fortune-telling niche.
          It supports analysis, draft review, scheduling, safety checks, and reporting.
        </p>
      </Section>

      <Section title="2. Prohibited Use">
        <ul className="list-disc space-y-2 pl-6">
          <li>Saving Threads or Meta passwords.</li>
          <li>Automated login, browser scraping, or screen automation.</li>
          <li>Automatic likes, follows, reply spam, or other artificial engagement.</li>
          <li>Mass generation and repeated posting of fortune-telling templates without human review.</li>
          <li>Using the service to evade platform restrictions or safety systems.</li>
        </ul>
      </Section>

      <Section title="3. Human Approval">
        <p>
          Posts must pass safety checks and human approval before scheduling or publishing. The system is designed to encourage diverse,
          natural, and human-edited posts.
        </p>
      </Section>

      <Section title="4. API Use">
        <p>
          Threads access must use official Meta/Threads APIs and valid permissions. API keys, app secrets, and access tokens must be kept
          server-side and must not be embedded in public client-side code.
        </p>
      </Section>

      <Section title="5. Contact">
        <p>Contact: hikaru630924@gmail.com</p>
      </Section>

      <Section title="6. Last Updated">
        <p>May 17, 2026</p>
      </Section>
    </PublicDocumentLayout>
  );
}
