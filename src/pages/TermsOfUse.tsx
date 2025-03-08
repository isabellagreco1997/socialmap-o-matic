import { ScrollArea } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet";
import { env } from "@/utils/env";

export default function TermsOfUse() {
  return (
    <>
      <Helmet>
        <title>Terms of Use - {env.app.name}</title>
        <meta name="description" content={`Terms of Use for ${env.app.name} - Professional network visualization and mapping tool. Read our terms and conditions for using the ${env.app.name} platform.`} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${env.app.url}/terms`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className={`text-4xl font-bold text-[${env.brand.color}] mb-4`}>Terms of Use</h1>
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
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          By accessing and using {env.app.name} ("the Service"), you accept and agree to be bound by the terms and conditions outlined in this agreement.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>2. Description of Service</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          {env.app.name} is a web application that enables users to create, manage, and visualize professional network connections through an interactive interface.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>3. User Registration</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          To use {env.app.name}, you must register for an account. You agree to provide accurate and complete information during registration and to update such information to keep it accurate and current.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>4. User Content</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          You retain all rights to any content you submit, post or display on or through the Service. By submitting content to {env.app.name}, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>5. Privacy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using {env.app.name}, you agree to our Privacy Policy.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>6. Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>7. Prohibited Activities</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          You agree not to engage in any of the following activities:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>Violating laws or regulations</li>
                          <li>Infringing on intellectual property rights</li>
                          <li>Transmitting harmful code or malware</li>
                          <li>Attempting to gain unauthorized access to other accounts or systems</li>
                          <li>Harassing or threatening other users</li>
                        </ul>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>8. Termination</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          We reserve the right to terminate or suspend your account at any time for any reason, including violation of these terms.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>9. Changes to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          We may modify these terms at any time. We will notify users of any material changes through the Service or via email.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>10. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          {env.app.name} is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service.
                        </p>
                      </section>

                      <section>
                        <h2 className={`text-2xl font-semibold text-[${env.brand.color}] mb-4`}>11. Contact Information</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          For questions about these Terms of Use, please contact us at{" "}
                          <a href={`mailto:${env.app.supportEmail}`} className={`text-[${env.brand.color}] hover:underline`}>
                            {env.app.supportEmail}
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