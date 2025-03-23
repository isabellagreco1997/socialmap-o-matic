import { ScrollArea } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet";
import { env } from "@/utils/env";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, UserCheck, Database, Globe, BellRing, Users, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

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
              <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-950">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            </div>
          </div>
          
          {/* Last updated info and intro box */}
          <div className="bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900 border rounded-lg p-5 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Data Protection</h2>
                <p className="text-muted-foreground">
                  We're committed to protecting your personal information and being transparent about how we use it.
                </p>
              </div>
              <div className="text-sm text-muted-foreground border-l-0 md:border-l pl-0 md:pl-4 border-indigo-200 dark:border-indigo-800">
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
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">1</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Introduction</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            At {env.app.name}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. We are committed to ensuring the privacy and security of your personal data.
                          </p>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            By using {env.app.name}, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
                          </p>
                          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900 p-4 mt-4">
                            <div className="flex gap-3">
                              <Lock className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                              <p className="text-sm">
                                We designed {env.app.name} with privacy in mind and will never sell your personal information to third parties.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">2</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Information We Collect</h2>
                          <div className="space-y-8">
                            <div className="rounded-lg border p-5">
                              <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-950">
                                  <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-medium mb-1">Personal Information</h3>
                                  <p className="text-muted-foreground text-sm">Information you provide directly to us</p>
                                </div>
                              </div>
                              <p className="text-muted-foreground leading-relaxed mb-3">We collect information that you provide directly to us, including:</p>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  Name and email address
                                </li>
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  Profile information
                                </li>
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  Network connection data
                                </li>
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  Communication preferences
                                </li>
                              </ul>
                            </div>

                            <div className="rounded-lg border p-5">
                              <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-950">
                                  <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-medium mb-1">Usage Information</h3>
                                  <p className="text-muted-foreground text-sm">Automatically collected from your device</p>
                                </div>
                              </div>
                              <p className="text-muted-foreground leading-relaxed mb-3">We automatically collect certain information about your device, including:</p>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  IP address
                                </li>
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  Browser type
                                </li>
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  Operating system
                                </li>
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  Access times and dates
                                </li>
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  Pages viewed
                                </li>
                                <li className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-md p-2">
                                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                  Interaction with features
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">3</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">How We Use Your Information</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-green-100 dark:bg-green-950 p-2 rounded-md">
                                  <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="font-medium">Service Provision</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Provide, maintain, and improve our Service functionality and features</p>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-md">
                                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-medium">Personalization</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Customize and tailor your experience on our platform</p>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-amber-100 dark:bg-amber-950 p-2 rounded-md">
                                  <BellRing className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="font-medium">Communication</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Send service updates, security alerts, and support messages</p>
                            </div>
                            
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-purple-100 dark:bg-purple-950 p-2 rounded-md">
                                  <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="font-medium">Security</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Detect, prevent, and address technical and security issues</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">4</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Information Sharing</h2>
                          <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-5 text-muted-foreground space-y-4">
                            <p className="font-medium text-foreground">We do not sell or rent your personal information to third parties.</p>
                            <p>We may share your information in the following limited circumstances:</p>
                            <ul className="space-y-3 pl-5 list-disc">
                              <li><span className="font-medium text-indigo-600 dark:text-indigo-400">With your consent:</span> When you have explicitly allowed us to share your data</li>
                              <li><span className="font-medium text-indigo-600 dark:text-indigo-400">Legal obligations:</span> To comply with laws, regulations, or legal processes</li>
                              <li><span className="font-medium text-indigo-600 dark:text-indigo-400">Protection:</span> To protect our rights, privacy, safety, or property</li>
                              <li><span className="font-medium text-indigo-600 dark:text-indigo-400">Service providers:</span> With vendors who assist in our operations under strict confidentiality agreements</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">5</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Data Security</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            <div className="flex items-start gap-2 border rounded-md p-3">
                              <Lock className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <h3 className="text-sm font-medium">Encryption</h3>
                                <p className="text-xs text-muted-foreground">Data is encrypted in transit and at rest</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 border rounded-md p-3">
                              <Lock className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <h3 className="text-sm font-medium">Access Controls</h3>
                                <p className="text-xs text-muted-foreground">Strict employee access limitations</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 border rounded-md p-3">
                              <Lock className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <h3 className="text-sm font-medium">Regular Audits</h3>
                                <p className="text-xs text-muted-foreground">Ongoing security assessment</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 border rounded-md p-3">
                              <Lock className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <h3 className="text-sm font-medium">Incident Response</h3>
                                <p className="text-xs text-muted-foreground">Procedures for security events</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground leading-relaxed mt-4">
                            While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">6</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Your Rights</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            Depending on your location, you may have certain rights regarding your personal information. These may include:
                          </p>
                          <div className="border rounded-lg divide-y mt-4">
                            <div className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-medium">Access</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 pl-4">Request a copy of your personal information</p>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-medium">Correction</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 pl-4">Request correction of inaccurate data</p>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-medium">Deletion</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 pl-4">Request deletion of your personal data</p>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-medium">Objection</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 pl-4">Object to processing of your personal data</p>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-medium">Data Portability</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 pl-4">Request a copy of your data in a structured format</p>
                            </div>
                          </div>
                          <p className="text-muted-foreground leading-relaxed mt-4">
                            To exercise any of these rights, please contact us at <a href={`mailto:${env.app.privacyEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{env.app.privacyEmail}</a>.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">7</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Cookies and Tracking</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            We use cookies and similar tracking technologies to collect and track information about your browsing activities on our website. Cookies are small data files stored on your device that help us improve the Service and your experience.
                          </p>
                          <div className="border rounded-lg p-4 mt-4 bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-medium mb-2">Types of cookies we use:</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                                <div>
                                  <span className="font-medium text-foreground">Essential cookies:</span> Required for the Service to function properly
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                                <div>
                                  <span className="font-medium text-foreground">Preference cookies:</span> Remember your settings and preferences
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                                <div>
                                  <span className="font-medium text-foreground">Analytics cookies:</span> Help us understand how users interact with our Service
                                </div>
                              </li>
                            </ul>
                          </div>
                          <p className="text-muted-foreground leading-relaxed mt-4">
                            You can control cookies through your browser settings. However, blocking certain cookies may impact the functionality of our Service.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">8</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Children's Privacy</h2>
                          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 text-muted-foreground">
                            <p>
                              Our Service is not directed to children under 13 years of age. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us. If we discover that a child under 13 has provided us with personal information, we will promptly delete such information from our servers.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">9</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Changes to Privacy Policy</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this page.
                          </p>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">10</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Contact Us</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at:{" "}
                            <a href={`mailto:${env.app.privacyEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                              {env.app.privacyEmail}
                            </a>
                          </p>
                          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-lg p-4 mt-6">
                            <p className="text-sm text-center">
                              By using {env.app.name}, you consent to our Privacy Policy and agree to its terms.
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