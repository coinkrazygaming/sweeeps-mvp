import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <Crown className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold gradient-gold bg-clip-text text-transparent">
              CrownPlay
            </span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: January 2024</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-slate-400">
              CrownPlay ("Company" or "We") respects the privacy of our users
              ("User" or "You"). This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our
              website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Information We Collect
            </h2>
            <p className="text-slate-400 mb-3">
              We may collect information about you in a variety of ways:
            </p>
            <h3 className="text-lg font-semibold text-white mb-2">
              Personal Data
            </h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Email address</li>
              <li>Username and password</li>
              <li>Full name</li>
              <li>Date of birth</li>
              <li>Address and location information</li>
              <li>Payment information (processed securely)</li>
              <li>Game history and preferences</li>
            </ul>
            <h3 className="text-lg font-semibold text-white mb-2">
              Technical Data
            </h3>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Usage data and analytics</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Use of Your Information
            </h2>
            <p className="text-slate-400 mb-3">
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Provide, operate, and maintain our services</li>
              <li>Verify your identity and prevent fraud</li>
              <li>Process transactions and send related information</li>
              <li>Comply with legal obligations</li>
              <li>Generate insights and analytics</li>
              <li>Communicate promotional offers and updates</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Monitor and improve our services</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Security of Your Information
            </h2>
            <p className="text-slate-400">
              We use administrative, technical, and physical security measures
              to help protect your personal information. However, no method of
              transmission over the Internet is 100% secure. While we strive to
              use commercially acceptable means to protect your personal
              information, we cannot guarantee its absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Data Retention
            </h2>
            <p className="text-slate-400">
              We will retain your personal information for as long as necessary
              to provide our services and comply with our legal obligations. You
              can request deletion of your account and associated data at any
              time by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Sharing Your Information
            </h2>
            <p className="text-slate-400">
              We do not sell, trade, or rent your personal information to third
              parties. We may share information with trusted service providers
              who assist us in operating our website and conducting our
              business, subject to confidentiality agreements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Cookies and Tracking
            </h2>
            <p className="text-slate-400">
              CrownPlay uses cookies and similar tracking technologies to
              enhance your experience. You can refuse cookies through your
              browser settings, though this may affect functionality.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-slate-400 mb-3">
              Depending on your location, you may have certain rights regarding
              your personal information:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Right to access your personal information</li>
              <li>Right to correct inaccurate information</li>
              <li>Right to delete your information</li>
              <li>Right to withdraw consent</li>
              <li>Right to data portability</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Third-Party Links
            </h2>
            <p className="text-slate-400">
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices of these external sites.
              Please review their privacy policies before providing your
              information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Changes to This Policy
            </h2>
            <p className="text-slate-400">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or technology. We will notify you of
              material changes by email or by posting the updated policy on our
              website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-400">
              If you have questions or concerns about this Privacy Policy,
              please contact us at:
            </p>
            <div className="mt-4 text-slate-400">
              <p>Email: privacy@crownplay.com</p>
              <p>Address: CrownPlay, United States</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border border-yellow-400/20 bg-yellow-400/5">
            <p className="text-yellow-200 text-sm">
              Your privacy is important to us. If you have any questions about
              how we handle your data, please don't hesitate to reach out.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Button asChild className="gradient-gold">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500 text-sm">
            © 2024 CrownPlay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
