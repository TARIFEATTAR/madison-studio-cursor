const LAST_UPDATED = "November 18, 2025";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By creating an account, accessing, or using Madison Studio (the “Service”), you agree to these Terms of Service (“Terms”), our Privacy Policy, and any supplemental policies referenced herein. If you are using the Service on behalf of a company or organization, you represent that you have authority to bind that entity and agree to these Terms on its behalf."
    ]
  },
  {
    title: "2. Eligibility",
    body: [
      "You must be at least 18 years old and able to form a legally binding contract. You may use Madison Studio only in compliance with applicable laws, regulations, and industry standards."
    ]
  },
  {
    title: "3. Accounts & Security",
    body: [
      "You are responsible for maintaining the confidentiality of your credentials and for all actions taken under your account.",
      "Notify us immediately at support@madisonstudio.io if you suspect unauthorized access or security incidents.",
      "We may suspend or terminate accounts suspected of unauthorized use, abuse, or violation of these Terms."
    ]
  },
  {
    title: "4. Subscription, Billing & Trials",
    body: [
      "Paid plans are billed in advance according to the subscription tier you select. Fees are non-refundable except where required by law.",
      "Trials or promotional credits may be offered at our discretion and can be modified or discontinued at any time.",
      "Failure to pay fees when due may result in downgrading, suspension, or termination of access to premium features."
    ]
  },
  {
    title: "5. AI Outputs & Content Usage",
    body: [
      "Madison Studio generates AI outputs based on your prompts, assets, and configurations. You are responsible for reviewing and approving all content before publication.",
      "We grant you a license to use AI outputs for your business, subject to these Terms and any third-party model or content restrictions.",
      "You agree not to use the Service to create content that is unlawful, infringing, discriminatory, or violates the rights of others."
    ]
  },
  {
    title: "6. Intellectual Property",
    body: [
      "Madison Studio retains ownership of the platform, software, designs, trademarks, and proprietary technology.",
      "You retain ownership of your prompts, uploaded assets, and original brand materials. By submitting content, you grant us a limited license to host, process, and analyze it solely to provide the Service."
    ]
  },
  {
    title: "7. Confidentiality",
    body: [
      "Both parties agree to protect confidential information disclosed while using the Service. We will maintain appropriate safeguards to protect your confidential data.",
      "You agree not to disclose platform details, security mechanisms, or proprietary information without our written consent."
    ]
  },
  {
    title: "8. Third-Party Services",
    body: [
      "Integrations (e.g., Google Calendar, storage providers, AI models) are governed by their own terms. By enabling integrations, you authorize Madison Studio to exchange data as necessary to operate the feature."
    ]
  },
  {
    title: "9. Disclaimers",
    body: [
      "The Service is provided “as is” without warranties of any kind. Madison Studio does not guarantee uninterrupted access, error-free operation, or compatibility with your specific workflows.",
      "AI outputs may contain inaccuracies or hallucinations; you are responsible for verifying compliance, factual accuracy, and regulatory approvals."
    ]
  },
  {
    title: "10. Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, Madison Studio and its affiliates shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits or revenues, even if advised of the possibility.",
      "Our aggregate liability arising from or relating to the Service will not exceed the fees paid to Madison Studio during the twelve (12) months preceding the event giving rise to the claim."
    ]
  },
  {
    title: "11. Termination",
    body: [
      "You may cancel your subscription at any time through the billing portal or by contacting support.",
      "We may suspend or terminate access for any breach of these Terms, non-payment, fraudulent activity, or misuse of the Service. Upon termination, your right to use the Service immediately ceases."
    ]
  },
  {
    title: "12. Governing Law & Dispute Resolution",
    body: [
      "These Terms are governed by the laws of the State of Delaware, USA, without regard to conflicts of law principles.",
      "Any dispute shall be resolved through good-faith negotiations. If unresolved, the parties agree to binding arbitration in San Francisco County, California, except that either party may seek injunctive relief in court for unauthorized use of intellectual property."
    ]
  },
  {
    title: "13. Changes to the Terms",
    body: [
      "We may update these Terms to reflect product changes, legal requirements, or security enhancements. We will notify you of material changes by email or in-app notice. Continued use of the Service after changes become effective constitutes acceptance."
    ]
  },
  {
    title: "14. Contact Information",
    body: [
      "Madison Studio, Attn: Legal, 548 Market Street, Suite 12113, San Francisco, CA 94104, USA.",
      "Email: support@madisonstudio.io"
    ]
  }
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#FEFBF5] text-[#1F1A17]">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-[#8C6A4A] font-semibold">Madison Studio Legal</p>
          <h1 className="text-4xl font-serif text-[#1F1A17]">Terms of Service</h1>
          <p className="text-sm text-[#5C534B]">Effective date: {LAST_UPDATED}</p>
          <p className="text-base leading-relaxed text-[#3C352F]">
            These Terms of Service form a legally binding agreement between you and Madison Studio, outlining the rules, responsibilities, and limitations governing your access to the Madison creative intelligence platform.
          </p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="bg-white rounded-lg border border-[#E5DED3] shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#1F1A17]">{section.title}</h2>
              <ul className="list-disc list-inside space-y-2 text-[#3C352F]">
                {section.body.map((paragraph, index) => (
                  <li key={index} className="leading-relaxed text-base">
                    {paragraph}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="text-sm text-[#5C534B] space-y-2">
          <p>
            By accessing Madison Studio you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, please discontinue use of the Service.
          </p>
          <p>
            Questions about these Terms? Contact us at{" "}
            <a href="mailto:support@madisonstudio.io" className="text-[#8C6A4A] underline">
              support@madisonstudio.io
            </a>.
          </p>
        </footer>
      </div>
    </div>
  );
}

