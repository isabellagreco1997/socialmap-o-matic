import { ScrollArea } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet";

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - RelMaps</title>
        <meta name="description" content="Privacy Policy for RelMaps - Learn how we protect your data and maintain privacy in our professional network visualization platform." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://relmaps.com/privacy" />
      </Helmet>

      <article className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border p-6">
          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              At RelMaps, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Name and email address</li>
              <li>Profile information</li>
              <li>Network connection data</li>
              <li>Communication preferences</li>
            </ul>

            <h3>2.2 Usage Information</h3>
            <p>We automatically collect certain information about your device, including:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Access times and dates</li>
              <li>Pages viewed</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our Service</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Prevent fraudulent activities</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul>
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist in our operations</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to collect and track information about your browsing activities.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children.
            </p>

            <h2>9. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at privacy@relmaps.com.
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