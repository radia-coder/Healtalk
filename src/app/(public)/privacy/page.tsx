import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | HealTalk",
  description: "HealTalk's privacy policy and data protection practices - HIPAA & GDPR compliant",
};

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: {lastUpdated}
        </p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-text-secondary mb-4">
              Welcome to HealTalk. We are committed to protecting your personal information and your right to privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
              our mental health consultation platform.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                <strong>Important:</strong> This platform handles sensitive health information. We comply with HIPAA
                (Health Insurance Portability and Accountability Act) for U.S. users and GDPR (General Data Protection
                Regulation) for EU users.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li><strong>Account Information:</strong> Name, email address, phone number, date of birth, profile photo</li>
              <li><strong>Authentication:</strong> Password (encrypted), OAuth credentials (Google)</li>
              <li><strong>Payment Information:</strong> Billing address, payment method (processed securely via Stripe)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Health Information (PHI)</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Mental health screening assessment responses</li>
              <li>Messages exchanged with psychologists</li>
              <li>Appointment notes and progress tracking</li>
              <li>AI chatbot interactions</li>
              <li>Session recordings (only with explicit consent)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Professional Information (Psychologists)</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Credentials and license numbers</li>
              <li>Professional certifications and experience</li>
              <li>Specializations and hospital affiliations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location</li>
              <li>Usage data (pages visited, features used)</li>
              <li>Video call quality metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Facilitate video consultations between patients and psychologists</li>
              <li>Process appointments and payments</li>
              <li>Enable secure messaging and communication</li>
              <li>Provide AI-powered mental health screening</li>
              <li>Send appointment reminders and notifications</li>
              <li>Improve platform security and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                <strong>We do NOT sell your personal information.</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">With Service Providers (BAA-compliant):</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li><strong>Video Infrastructure:</strong> Agora.io (video calls)</li>
              <li><strong>Payment Processing:</strong> Stripe (secure payments)</li>
              <li><strong>Email Delivery:</strong> Resend (notifications)</li>
              <li><strong>Cloud Storage:</strong> UploadThing (file uploads)</li>
              <li><strong>AI Services:</strong> Google Gemini (chatbot, anonymized)</li>
              <li><strong>Error Monitoring:</strong> Sentry (no PHI)</li>
            </ul>
            <p className="text-sm text-muted-foreground italic mb-4">
              All service providers sign Business Associate Agreements (BAAs) to ensure HIPAA compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li><strong>Encryption:</strong> TLS 1.3 in transit, AES-256 at rest</li>
              <li><strong>Access Controls:</strong> Role-based access with MFA</li>
              <li><strong>Video Security:</strong> End-to-end encrypted calls</li>
              <li><strong>Backups:</strong> Automated daily backups with disaster recovery</li>
              <li><strong>Monitoring:</strong> 24/7 security monitoring and intrusion detection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">HIPAA Rights (U.S. Users)</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Access and obtain a copy of your health information</li>
              <li>Request corrections to your health information</li>
              <li>Request restrictions on use of your information</li>
              <li>Receive an accounting of disclosures</li>
              <li>File a complaint if rights are violated</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">GDPR Rights (EU Users)</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion (&ldquo;right to be forgotten&rdquo;)</li>
              <li><strong>Portability:</strong> Receive data in machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing</li>
            </ul>

            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="font-medium mb-2">To exercise your rights:</p>
              <p className="text-sm"><strong>Email:</strong> privacy@healtalk.com</p>
              <p className="text-sm"><strong>Subject:</strong> Privacy Rights Request</p>
              <p className="text-xs text-muted-foreground mt-2">We will respond within 30 days (GDPR) or 60 days (HIPAA)</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-text-secondary mb-4">
              We retain your information for as long as necessary to provide services and comply with legal
              obligations (typically 7 years for medical records). When you delete your account, we will delete
              or anonymize your personal information within 90 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li><strong>Essential Cookies:</strong> Authentication, session management</li>
              <li><strong>Analytics Cookies:</strong> Understand platform usage</li>
              <li><strong>Preference Cookies:</strong> Remember your settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p className="font-medium mb-4">HealTalk Privacy Officer</p>
              <p className="text-sm mb-2"><strong>Email:</strong> privacy@healtalk.com</p>
              <p className="text-sm mb-2"><strong>Support:</strong> support@healtalk.com</p>
              <p className="text-sm text-muted-foreground mt-4">
                For HIPAA complaints, contact the U.S. Department of Health and Human Services Office for Civil Rights.
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            <p><strong>Last Updated:</strong> {lastUpdated}</p>
            <p className="mt-2">Version 1.0</p>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <Link
            href="/terms"
            className="inline-flex items-center rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
          >
            Terms of Service
          </Link>
          <Link
            href="/hipaa"
            className="inline-flex items-center rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
          >
            HIPAA Notice
          </Link>
        </div>
      </div>
    </main>
  );
}
