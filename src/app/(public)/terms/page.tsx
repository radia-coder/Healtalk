/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | HealTalk",
  description: "Terms of Service for using the HealTalk mental health platform",
};

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: {lastUpdated}
        </p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-text-secondary mb-4">
              By accessing or using HealTalk ("Platform," "Service," "we," "us," or "our"), you agree to be
              bound by these Terms of Service. If you disagree with any part of these terms, you may not
              access the Service.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                <strong>Emergency Notice:</strong> HealTalk is NOT for emergencies. If you are experiencing a
                mental health crisis, call 911 (US), 112 (EU), or your local emergency number immediately.
                You may also contact the National Suicide Prevention Lifeline at 988 (US).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-text-secondary mb-4">
              HealTalk is a telehealth platform that connects patients with licensed psychologists for
              video consultations, messaging, and mental health support services. We provide:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Video and audio consultation sessions</li>
              <li>Secure messaging between patients and psychologists</li>
              <li>AI-powered mental health screening assessments</li>
              <li>Group therapy sessions</li>
              <li>Progress tracking and appointment management</li>
            </ul>
            <p className="text-text-secondary mb-4">
              <strong>Important:</strong> HealTalk is a platform service only. We do not provide medical
              advice, diagnosis, or treatment. All clinical services are provided by independent licensed
              psychologists who use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Eligibility</h2>
            <p className="text-text-secondary mb-4">You must meet the following requirements to use our Service:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Be at least 18 years old</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not be prohibited from using the Service under applicable law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Account Registration</h3>
            <p className="text-text-secondary mb-4">
              You must create an account to access most features of the Service. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password confidential</li>
              <li>Notify us immediately of any unauthorized account access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Account Types</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li><strong>Patient Accounts:</strong> For individuals seeking mental health services</li>
              <li><strong>Psychologist Accounts:</strong> For licensed mental health professionals (subject to verification)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Psychologist Verification</h3>
            <p className="text-text-secondary mb-4">
              Psychologists must provide valid licensing credentials before approval. We verify:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Professional license numbers and validity</li>
              <li>Educational credentials</li>
              <li>Malpractice insurance (where required)</li>
              <li>Good standing with licensing boards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Services and Limitations</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Not Emergency Services</h3>
            <p className="text-text-secondary mb-4">
              HealTalk is NOT intended for emergency situations. Do not use this Service if you are
              experiencing a medical or psychiatric emergency. Call emergency services immediately.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Not a Substitute for In-Person Care</h3>
            <p className="text-text-secondary mb-4">
              While telehealth can be effective, it may not be appropriate for all conditions.
              Your psychologist may recommend in-person care if necessary.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Geographic and Licensing Limitations</h3>
            <p className="text-text-secondary mb-4">
              Psychologists can only provide services in jurisdictions where they are licensed.
              You must be physically located in the psychologist's licensed jurisdiction during sessions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Appointments and Payments</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Booking and Fees</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Session fees are set by individual psychologists and displayed before booking</li>
              <li>Payment is required at the time of booking</li>
              <li>Prices are in your local currency and include applicable taxes</li>
              <li>Platform fees may apply</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Cancellation Policy</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li><strong>24+ hours notice:</strong> Full refund</li>
              <li><strong>Less than 24 hours:</strong> 50% refund (at psychologist's discretion)</li>
              <li><strong>No-show:</strong> No refund</li>
            </ul>
            <p className="text-sm text-muted-foreground italic mb-4">
              Individual psychologists may have different cancellation policies, which will be disclosed before booking.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Technical Issues</h3>
            <p className="text-text-secondary mb-4">
              If a session cannot be completed due to our platform's technical issues, you will receive
              a full refund or credit for a future session.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. User Conduct</h2>
            <p className="text-text-secondary mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Violate any laws or regulations</li>
              <li>Harass, abuse, or harm others</li>
              <li>Impersonate another person or entity</li>
              <li>Share your account with others</li>
              <li>Interfere with the Service's operation</li>
              <li>Attempt to gain unauthorized access to systems or data</li>
              <li>Record sessions without explicit consent from all parties</li>
              <li>Use the Service for any commercial purpose without authorization</li>
              <li>Share or disclose another user's personal information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p className="text-text-secondary mb-4">
              The Service and its original content, features, and functionality are owned by HealTalk
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-text-secondary mb-4">
              You retain ownership of any content you submit, but grant us a license to use, modify,
              and display it as necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Privacy and Confidentiality</h2>
            <p className="text-text-secondary mb-4">
              Your use of the Service is governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              Please review it carefully.
            </p>
            <p className="text-text-secondary mb-4">
              <strong>Patient-Psychologist Confidentiality:</strong> Communications between you and your
              psychologist are confidential, subject to legal exceptions (e.g., imminent harm, child abuse).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Disclaimers and Limitations of Liability</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.1 Service "As Is"</h3>
            <p className="text-text-secondary mb-4">
              The Service is provided "as is" and "as available" without warranties of any kind, either
              express or implied, including but not limited to warranties of merchantability, fitness for
              a particular purpose, or non-infringement.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.2 No Medical Guarantees</h3>
            <p className="text-text-secondary mb-4">
              We do not guarantee any specific outcomes from using the Service. Treatment results vary
              by individual and condition.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">10.3 Limitation of Liability</h3>
            <p className="text-text-secondary mb-4">
              To the maximum extent permitted by law, HealTalk shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
              Our total liability shall not exceed the amount you paid to us in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="text-text-secondary mb-4">
              We may terminate or suspend your account immediately, without prior notice, if you breach
              these Terms. You may also terminate your account at any time through your account settings.
            </p>
            <p className="text-text-secondary mb-4">
              Upon termination, your right to use the Service will immediately cease. Data retention
              is governed by our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-text-secondary mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material
              changes by email or through the Service. Your continued use after changes constitutes
              acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law and Disputes</h2>
            <p className="text-text-secondary mb-4">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
              without regard to its conflict of law provisions.
            </p>
            <p className="text-text-secondary mb-4">
              Any disputes arising from these Terms or the Service shall be resolved through binding
              arbitration, except where prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p className="font-medium mb-4">HealTalk Legal Department</p>
              <p className="text-sm mb-2"><strong>Email:</strong> legal@healtalk.com</p>
              <p className="text-sm mb-2"><strong>Support:</strong> support@healtalk.com</p>
              <p className="text-sm mb-2"><strong>Address:</strong> [Your Business Address]</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            <p><strong>Last Updated:</strong> {lastUpdated}</p>
            <p className="mt-2">Version 1.0</p>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <Link
            href="/privacy"
            className="inline-flex items-center rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
          >
            Privacy Policy
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
