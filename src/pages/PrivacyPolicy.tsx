const LAST_UPDATED = "November 18, 2025";

const sections = [
  {
    title: "1. Overview",
    body: [
      "Madison Studio (“Madison”, “we”, “us”, or “our”) provides AI-assisted creative tools that help luxury brands generate editorial content, imagery, and strategy. This Privacy Policy explains how we collect, use, and protect information across our website, application, and related services (collectively, the “Services”)."
    ]
  },
  {
    title: "2. Information We Collect",
    body: [
      "Account information such as name, email address, organization details, and authentication metadata.",
      "Content, prompts, reference assets, and feedback that you submit through the Services.",
      "Usage data including device identifiers, browser type, IP address, time zone, pages visited, and product telemetry.",
      "Billing and subscription information processed securely via our payment partners.",
      "Third-party data that you authorize us to access (e.g., Google Calendar) via OAuth or API connections."
    ]
  },
  {
    title: "3. How We Use Information",
    body: [
      "Operate, maintain, and improve the Madison Studio platform and customer experience.",
      "Generate AI outputs, derivative content, and analytics requested by your team.",
      "Provide customer support, onboarding, and product communications.",
      "Detect, investigate, and prevent fraud, abuse, or security threats.",
      "Meet legal, contractual, and compliance obligations."
    ]
  },
  {
    title: "4. How We Share Information",
    body: [
      "With trusted infrastructure, AI, and analytics partners under strict confidentiality agreements.",
      "With your organization’s administrators for account management and billing.",
      "When required by law, subpoena, or to protect the rights, safety, or property of Madison, our customers, or the public.",
      "In connection with a merger, financing, acquisition, or restructuring, subject to appropriate safeguards."
    ]
  },
  {
    title: "5. Data Retention & Security",
    body: [
      "We retain data only as long as necessary to deliver the Services, comply with legal obligations, and enforce agreements.",
      "Madison implements administrative, technical, and physical safeguards such as encryption in transit, access controls, network monitoring, and regular security reviews.",
      "If you terminate your account, we will delete or anonymize associated data within a commercially reasonable period unless retention is required by law."
    ]
  },
  {
    title: "6. Your Choices & Rights",
    body: [
      "You may access, correct, or delete most profile information in the application settings.",
      "You can request export or deletion of your data by emailing support@madisonstudio.io. We will respond consistent with applicable privacy laws.",
      "Marketing emails include an unsubscribe link. Transactional and product communications are required for service delivery.",
      "For OAuth or third-party integrations, revoke access directly with the provider (e.g., Google Account permissions)."
    ]
  },
  {
    title: "7. International Transfers",
    body: [
      "Madison is headquartered in the United States. If you access the Services from other regions, you consent to the transfer, storage, and processing of your information in the U.S. and anywhere our service providers operate.",
      "We use contractual safeguards such as Standard Contractual Clauses when transferring personal data from the European Economic Area or the United Kingdom."
    ]
  },
  {
    title: "8. Children’s Privacy",
    body: [
      "The Services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children. If you believe a child provided information, contact us so we can take appropriate action."
    ]
  },
  {
    title: "9. Changes to This Policy",
    body: [
      "We may update this Privacy Policy to reflect product, legal, or operational changes. We will notify you of material updates via email or in-app notice. Continued use of the Services constitutes acceptance of the updated policy."
    ]
  },
  {
    title: "10. Contact Us",
    body: [
      "Questions or requests about privacy should be sent to support@madisonstudio.io.",
      "Madison Studio, Attn: Privacy, 548 Market Street, Suite 12113, San Francisco, CA 94104, USA."
    ]
  }
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FFFEF2] text-[#1F1A17]">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-sm tracking-wide uppercase text-[#8C6A4A] font-semibold">
            Madison Studio Legal
          </p>
          <h1 className="text-4xl font-serif text-[#1F1A17]">Privacy Policy</h1>
          <p className="text-sm text-[#5C534B]">Last updated: {LAST_UPDATED}</p>
          <p className="text-base leading-relaxed text-[#3C352F]">
            Protecting the confidentiality and integrity of your brand data is foundational to Madison Studio. This policy explains how we collect, use, and safeguard information so you can make informed decisions when using our creative intelligence platform.
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

        <footer className="text-sm text-[#5C534B]">
          <p>
            If you require a signed Data Processing Agreement or have jurisdiction-specific requirements (e.g., GDPR, CCPA), contact our privacy team at{" "}
            <a href="mailto:support@madisonstudio.io" className="text-[#8C6A4A] underline">
              support@madisonstudio.io
            </a>.
          </p>
        </footer>
      </div>
    </div>
  );
}

