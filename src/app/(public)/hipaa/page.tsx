import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HIPAA Notice of Privacy Practices | HealTalk",
  description: "HealTalk's HIPAA Notice of Privacy Practices for protected health information",
};

export default function HipaaPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          HIPAA Notice of Privacy Practices
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Effective Date: {lastUpdated}
        </p>

        <div className="prose prose-slate max-w-none space-y-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              <strong>THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND
              DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.</strong>
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">About This Notice</h2>
            <p className="text-text-secondary mb-4">
              HealTalk is committed to protecting your health information. This Notice of Privacy Practices
              describes how we may use and disclose your Protected Health Information (PHI) to carry out
              treatment, payment, or health care operations, and for other purposes permitted or required
              by law. It also describes your rights to access and control your PHI.
            </p>
            <p className="text-text-secondary mb-4">
              We are required by law to maintain the privacy of your PHI, provide you with this notice,
              follow the terms of the notice currently in effect, and notify you if a breach of your
              unsecured PHI occurs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What is Protected Health Information (PHI)?</h2>
            <p className="text-text-secondary mb-4">
              PHI is any information about you, including demographic information, that may identify you
              and relates to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Your past, present, or future physical or mental health or condition</li>
              <li>The provision of health care to you</li>
              <li>Payment for the provision of health care to you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We May Use and Disclose Your PHI</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">1. Treatment</h3>
            <p className="text-text-secondary mb-4">
              We may use and disclose your PHI to provide, coordinate, or manage your mental health care
              and related services. This includes consultation between health care providers.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm"><strong>Example:</strong> We may share your assessment results with your
              psychologist to help them understand your needs before your first session.</p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">2. Payment</h3>
            <p className="text-text-secondary mb-4">
              We may use and disclose your PHI to bill and collect payment for services provided to you.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm"><strong>Example:</strong> We may provide your session information to
              your insurance company to process a claim for reimbursement.</p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">3. Health Care Operations</h3>
            <p className="text-text-secondary mb-4">
              We may use and disclose your PHI for our health care operations, including quality assessment,
              credentialing of psychologists, and business planning.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm"><strong>Example:</strong> We may review session records to evaluate
              the quality of care provided and improve our services.</p>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">4. Business Associates</h3>
            <p className="text-text-secondary mb-4">
              We may share your PHI with third-party service providers (Business Associates) who perform
              functions on our behalf. These entities are contractually required to safeguard your information.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm"><strong>Business Associates include:</strong></p>
              <ul className="text-sm list-disc pl-4 mt-2 space-y-1">
                <li>Video call infrastructure providers (Agora.io)</li>
                <li>Payment processors (Stripe)</li>
                <li>Email service providers (Resend)</li>
                <li>Cloud storage providers (UploadThing)</li>
                <li>IT support and security vendors</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Uses and Disclosures That May Be Made Without Your Authorization</h2>
            <p className="text-text-secondary mb-4">
              We may use and disclose your PHI in the following situations without your authorization:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">1. When Required by Law</h3>
            <p className="text-text-secondary mb-4">
              We will disclose PHI when required by federal, state, or local law, including court orders,
              subpoenas, or other legal process.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">2. Public Health Activities</h3>
            <p className="text-text-secondary mb-4">
              We may disclose PHI to public health authorities for activities such as preventing or
              controlling disease, injury, or disability.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3. Victims of Abuse, Neglect, or Domestic Violence</h3>
            <p className="text-text-secondary mb-4">
              We may disclose PHI to appropriate authorities if we reasonably believe you are a victim
              of abuse, neglect, or domestic violence.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4. Health Oversight Activities</h3>
            <p className="text-text-secondary mb-4">
              We may disclose PHI to health oversight agencies for activities authorized by law, such
              as audits, investigations, or inspections.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5. Judicial and Administrative Proceedings</h3>
            <p className="text-text-secondary mb-4">
              We may disclose PHI in response to a court order, subpoena, discovery request, or other
              lawful process.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6. Law Enforcement</h3>
            <p className="text-text-secondary mb-4">
              We may disclose PHI to law enforcement officials for law enforcement purposes, such as
              identifying or locating a suspect, fugitive, or missing person.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7. Serious Threat to Health or Safety</h3>
            <p className="text-text-secondary mb-4">
              We may use and disclose PHI when necessary to prevent a serious threat to your health
              and safety or the health and safety of the public or another person.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                <strong>Important:</strong> If you communicate threats of harm to yourself or others,
                we are required by law to take protective action, which may include notifying law
                enforcement or emergency services.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Uses and Disclosures That Require Your Written Authorization</h2>
            <p className="text-text-secondary mb-4">
              Other uses and disclosures not described in this Notice will be made only with your written
              authorization. You may revoke your authorization at any time, in writing, except to the
              extent that we have already taken action based on your authorization.
            </p>
            <p className="text-text-secondary mb-4">
              We will never use or disclose your PHI for the following without your authorization:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-text-secondary">
              <li>Marketing purposes</li>
              <li>Sale of PHI</li>
              <li>Psychotherapy notes (if applicable)</li>
              <li>Research purposes (unless specifically exempted by law)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights Regarding Your PHI</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">1. Right to Access</h3>
            <p className="text-text-secondary mb-4">
              You have the right to inspect and obtain a copy of your PHI. To request access, submit
              a written request to privacy@healtalk.com. We may charge a reasonable fee for copying
              and mailing costs.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">2. Right to Amend</h3>
            <p className="text-text-secondary mb-4">
              If you believe your PHI is incorrect or incomplete, you may request an amendment. We may
              deny your request in certain circumstances. To request an amendment, submit a written
              request to privacy@healtalk.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3. Right to an Accounting of Disclosures</h3>
            <p className="text-text-secondary mb-4">
              You have the right to receive a list of certain disclosures we have made of your PHI.
              To request an accounting, submit a written request to privacy@healtalk.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4. Right to Request Restrictions</h3>
            <p className="text-text-secondary mb-4">
              You have the right to request restrictions on certain uses and disclosures of your PHI.
              We are not required to agree to your request except in certain circumstances. To request
              restrictions, submit a written request to privacy@healtalk.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5. Right to Request Confidential Communications</h3>
            <p className="text-text-secondary mb-4">
              You have the right to request that we communicate with you about your PHI by alternative
              means or at alternative locations. To request confidential communications, submit a written
              request to privacy@healtalk.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6. Right to a Paper Copy of This Notice</h3>
            <p className="text-text-secondary mb-4">
              You have the right to a paper copy of this Notice, even if you have agreed to receive it
              electronically. To obtain a paper copy, contact support@healtalk.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7. Right to Breach Notification</h3>
            <p className="text-text-secondary mb-4">
              You have the right to be notified in the event of a breach of your unsecured PHI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How to Exercise Your Rights</h2>
            <p className="text-text-secondary mb-4">
              To exercise any of your rights described in this Notice, please submit a written request to:
            </p>
            <div className="bg-muted p-6 rounded-lg mb-4">
              <p className="font-medium mb-4">HealTalk Privacy Officer</p>
              <p className="text-sm mb-2"><strong>Email:</strong> privacy@healtalk.com</p>
              <p className="text-sm mb-2"><strong>Subject Line:</strong> HIPAA Privacy Rights Request</p>
              <p className="text-sm mb-2"><strong>Support:</strong> support@healtalk.com</p>
            </div>
            <p className="text-text-secondary mb-4">
              We will respond to your request within 30 days for most requests, or within 60 days for
              requests to access or amend your PHI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Complaints</h2>
            <p className="text-text-secondary mb-4">
              If you believe your privacy rights have been violated, you may file a complaint with:
            </p>
            <div className="space-y-4 mb-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium mb-2">HealTalk:</p>
                <p className="text-sm">Email: privacy@healtalk.com</p>
                <p className="text-sm">Subject: HIPAA Privacy Complaint</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium mb-2">U.S. Department of Health and Human Services:</p>
                <p className="text-sm">Office for Civil Rights</p>
                <p className="text-sm">200 Independence Avenue, S.W.</p>
                <p className="text-sm">Washington, D.C. 20201</p>
                <p className="text-sm">Phone: 1-877-696-6775</p>
                <p className="text-sm">Website: www.hhs.gov/ocr/privacy</p>
              </div>
            </div>
            <p className="text-text-secondary mb-4">
              <strong>You will not be retaliated against for filing a complaint.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Notice</h2>
            <p className="text-text-secondary mb-4">
              We reserve the right to change this Notice and to make the revised or changed Notice
              effective for PHI we already have about you as well as any information we receive in
              the future. We will post the current Notice on our website and make copies available
              upon request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p className="font-medium mb-4">HealTalk Privacy Officer</p>
              <p className="text-sm mb-2"><strong>Email:</strong> privacy@healtalk.com</p>
              <p className="text-sm mb-2"><strong>Support:</strong> support@healtalk.com</p>
              <p className="text-sm mb-2"><strong>Phone:</strong> [Your Phone Number]</p>
              <p className="text-sm mb-2"><strong>Address:</strong> [Your Business Address]</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            <p><strong>Effective Date:</strong> {lastUpdated}</p>
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
            href="/terms"
            className="inline-flex items-center rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
