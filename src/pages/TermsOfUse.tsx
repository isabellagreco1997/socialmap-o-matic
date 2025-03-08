import { ScrollArea } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet";

export default function TermsOfUse() {
  return (
    <>
      <Helmet>
        <title>Terms of Use - RelMaps</title>
        <meta name="description" content="Terms of Use for RelMaps - Professional network visualization and mapping tool. Read our terms and conditions for using the RelMaps platform." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://relmaps.com/terms" />
      </Helmet>

      <article className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
        <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border p-6">
          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using RelMaps ("the Service"), you accept and agree to be bound by the terms and conditions outlined in this agreement.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              RelMaps is a web application that enables users to create, manage, and visualize professional network connections through an interactive interface.
            </p>

            <h2>3. User Registration</h2>
            <p>
              To use RelMaps, you must register for an account. You agree to provide accurate and complete information during registration and to update such information to keep it accurate and current.
            </p>

            <h2>4. User Content</h2>
            <p>
              You retain all rights to any content you submit, post or display on or through the Service. By submitting content to RelMaps, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.
            </p>

            <h2>5. Privacy</h2>
            <p>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using RelMaps, you agree to our Privacy Policy.
            </p>

            <h2>6. Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.
            </p>

            <h2>7. Prohibited Activities</h2>
            <p>
              You agree not to engage in any of the following activities:
            </p>
            <ul>
              <li>Violating laws or regulations</li>
              <li>Infringing on intellectual property rights</li>
              <li>Transmitting harmful code or malware</li>
              <li>Attempting to gain unauthorized access to other accounts or systems</li>
              <li>Harassing or threatening other users</li>
            </ul>

            <h2>8. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for any reason, including violation of these terms.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. We will notify users of any material changes through the Service or via email.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              RelMaps is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service.
            </p>

            <h2>11. Contact Information</h2>
            <p>
              For questions about these Terms of Use, please contact us at support@relmaps.com.
            </p>

            <div className="mt-8 text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </ScrollArea>
      </article>
    </>
  );
} 