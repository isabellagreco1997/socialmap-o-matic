import { ScrollArea } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet";
import { env } from "@/utils/env";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Check } from "lucide-react";
import { Link } from "react-router-dom";

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
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          {/* Back button and page header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft size={16} />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-950">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
            </div>
          </div>
          
          {/* Last updated info and intro box */}
          <div className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900 border rounded-lg p-5 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Legal Agreement</h2>
                <p className="text-muted-foreground">
                  These terms constitute a legal agreement between you and {env.app.name}.
                </p>
              </div>
              <div className="text-sm text-muted-foreground border-l-0 md:border-l pl-0 md:pl-4 border-blue-200 dark:border-blue-800">
                Last updated: <span className="font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
            
          <div className="bg-background rounded-xl shadow-lg border">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="p-6 md:p-8">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="space-y-12">
                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Acceptance of Terms</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            By accessing and using {env.app.name} ("the Service"), you accept and agree to be bound by the terms and conditions outlined in this agreement. If you do not agree to these terms, you must not access or use the Service.
                          </p>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            We may update these terms from time to time. Your continued use of the Service after any such changes constitutes your acceptance of the new terms.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Description of Service</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            {env.app.name} is a web application that enables users to create, manage, and visualize professional network connections through an interactive interface. The Service includes all content, features, and functionality offered by {env.app.name}.
                          </p>
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mt-4">
                            <h3 className="text-lg font-medium mb-2">Key Service Features</h3>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Network mapping and visualization tools</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Contact and relationship management</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Data integration and import functionality</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Collaboration and sharing capabilities</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">User Registration and Accounts</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            To use {env.app.name}, you must register for an account. You agree to provide accurate and complete information during registration and to update such information to keep it accurate and current.
                          </p>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            You are responsible for safeguarding the password that you use to access the Service. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.
                          </p>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            We reserve the right to disable any user account if, in our opinion, you have violated any provision of these Terms.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">4</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">User Content</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            You retain all rights to any content you submit, post or display on or through the Service ("User Content"). By submitting User Content to {env.app.name}, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.
                          </p>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            You represent and warrant that you have all necessary rights to grant this license. You also represent that your User Content does not violate any third-party rights, including intellectual property rights and privacy rights.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">5</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Privacy</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            Your privacy is important to us. Our <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link> explains how we collect, use, and protect your personal information. By using {env.app.name}, you agree to our Privacy Policy.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">6</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Security</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account or any other breach of security.
                          </p>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            We implement reasonable security measures to protect your account and personal information, but we cannot guarantee absolute security.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">7</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Prohibited Activities</h2>
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            You agree not to engage in any of the following activities:
                          </p>
                          <ul className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
                            <li className="flex items-start gap-2">
                              <div className="bg-red-100 dark:bg-red-950 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                              </div>
                              <span>Violating laws or regulations</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="bg-red-100 dark:bg-red-950 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                              </div>
                              <span>Infringing on intellectual property rights</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="bg-red-100 dark:bg-red-950 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                              </div>
                              <span>Transmitting harmful code or malware</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="bg-red-100 dark:bg-red-950 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                              </div>
                              <span>Attempting to gain unauthorized access to other accounts or systems</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="bg-red-100 dark:bg-red-950 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                              </div>
                              <span>Harassing or threatening other users</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="bg-red-100 dark:bg-red-950 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                              </div>
                              <span>Using the Service for any illegal or unauthorized purpose</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">8</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Termination</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to terminate or suspend your account at any time for any reason, including violation of these terms, without prior notice or liability.
                          </p>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">9</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Changes to Terms</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            We may modify these terms at any time at our sole discretion. We will notify users of any material changes through the Service or via email. Your continued use of the Service after such modifications constitutes your acceptance of the updated terms.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">10</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Limitation of Liability</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            {env.app.name} is provided "as is" without warranties of any kind, either express or implied. We are not liable for any damages arising from your use of the Service, including but not limited to direct, indirect, incidental, consequential, or punitive damages.
                          </p>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            In no event shall our total liability to you for all damages, losses, and causes of action exceed the amount paid by you, if any, for accessing or using the Service.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">11</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Contact Information</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            For questions about these Terms of Use, please contact us at{" "}
                            <a href={`mailto:${env.app.supportEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                              {env.app.supportEmail}
                            </a>
                          </p>
                          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-6">
                            <p className="text-sm text-center">
                              By using {env.app.name}, you acknowledge that you have read and understand these Terms of Use and agree to be bound by them.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
} 