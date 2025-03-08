import { ScrollArea } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet";
import { env } from "@/utils/env";

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - {env.app.name}</title>
        <meta name="description" content={`Privacy Policy for ${env.app.name} - Learn how we protect your data and maintain privacy in our professional network visualization platform.`} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${env.app.url}/privacy`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className={`text-4xl font-bold text-[${env.brand.color}] mb-4`}>Privacy Policy</h1>
              <p className="text-muted-foreground text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-background rounded-xl shadow-lg border">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="p-8">
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="space-y-12">
                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          At {env.app.name}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>2. Information We Collect</h2>
                        <div className="space-y-6">
                          <div>
                            <h3 className={`text-xl font-medium text-[${env.brand.color}] mb-3`}>2.1 Personal Information</h3>
                            <p className="text-muted-foreground leading-relaxed mb-3">We collect information that you provide directly to us, including:</p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                              <li>Name and email address</li>
                              <li>Profile information</li>
                              <li>Network connection data</li>
                              <li>Communication preferences</li>
                            </ul>
                          </div>

                          <div>
                            <h3 className={`text-xl font-medium text-[${env.brand.color}] mb-3`}>2.2 Usage Information</h3>
                            <p className="text-muted-foreground leading-relaxed mb-3">We automatically collect certain information about your device, including:</p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                              <li>IP address</li>
                              <li>Browser type</li>
                              <li>Operating system</li>
                              <li>Access times and dates</li>
                              <li>Pages viewed</li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>3. How We Use Your Information</h2>
                        <p className="text-muted-foreground leading-relaxed mb-3">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>Provide and maintain our Service</li>
                          <li>Improve and personalize your experience</li>
                          <li>Communicate with you</li>
                          <li>Monitor and analyze usage patterns</li>
                          <li>Prevent fraudulent activities</li>
                        </ul>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>4. Information Sharing</h2>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          We do not sell or rent your personal information to third parties. We may share your information in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>With your consent</li>
                          <li>To comply with legal obligations</li>
                          <li>To protect our rights and safety</li>
                          <li>With service providers who assist in our operations</li>
                        </ul>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>5. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>6. Your Rights</h2>
                        <p className="text-muted-foreground leading-relaxed mb-3">You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>Access your personal information</li>
                          <li>Correct inaccurate data</li>
                          <li>Request deletion of your data</li>
                          <li>Object to processing of your data</li>
                          <li>Export your data</li>
                        </ul>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>7. Cookies and Tracking</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          We use cookies and similar tracking technologies to collect and track information about your browsing activities.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>8. Children's Privacy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>9. Changes to Privacy Policy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>10. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          If you have questions about this Privacy Policy, please contact us at{" "}
                          <a href={`mailto:${env.app.privacyEmail}`} className={`text-[${env.brand.color}] hover:underline`}>
                            {env.app.privacyEmail}
                          </a>
                        </p>
                      </section>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 