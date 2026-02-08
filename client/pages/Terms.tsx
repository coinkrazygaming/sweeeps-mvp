import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

export default function Terms() {
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
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Last updated: January 2024</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-slate-400">
              By accessing and using CrownPlay, you accept and agree to be bound
              by and comply with these Terms of Service. If you do not agree to
              abide by the above, please do not use this service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Use License
            </h2>
            <p className="text-slate-400 mb-3">
              Permission is granted to temporarily download one copy of the
              materials (information or software) on CrownPlay for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>
                Using the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                Attempting to decompile or reverse engineer any software
                contained on the site
              </li>
              <li>
                Removing any copyright or other proprietary notations from the
                materials
              </li>
              <li>
                Transferring the materials to another person or "mirroring" the
                materials on any other server
              </li>
              <li>
                Attempting to gain unauthorized access to any portion of the
                site
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Disclaimer
            </h2>
            <p className="text-slate-400">
              The materials on CrownPlay are provided on an 'as is' basis.
              CrownPlay makes no warranties, expressed or implied, and hereby
              disclaims and negates all other warranties including, without
              limitation, implied warranties or conditions of merchantability,
              fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Limitations
            </h2>
            <p className="text-slate-400">
              In no event shall CrownPlay or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on CrownPlay, even if CrownPlay
              or a CrownPlay authorized representative has been notified orally
              or in writing of the possibility of such damage.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Accuracy of Materials
            </h2>
            <p className="text-slate-400">
              The materials appearing on CrownPlay could include technical,
              typographical, or photographic errors. CrownPlay does not warrant
              that any of the materials on the site are accurate, complete, or
              current. CrownPlay may make changes to the materials contained on
              the site at any time without notice.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">6. Links</h2>
            <p className="text-slate-400">
              CrownPlay has not reviewed all of the sites linked to the site and
              is not responsible for the contents of any such linked site. The
              inclusion of any link does not imply endorsement by CrownPlay of
              the site. Use of any such linked website is at the user's own
              risk.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              7. Modifications
            </h2>
            <p className="text-slate-400">
              CrownPlay may revise these Terms of Service for the site at any
              time without notice. By using this site, you are agreeing to be
              bound by the then current version of these Terms of Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              8. Governing Law
            </h2>
            <p className="text-slate-400">
              These Terms and Conditions are governed by and construed in
              accordance with the laws of the United States, and you irrevocably
              submit to the exclusive jurisdiction of the courts in that
              location.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              9. Age Verification
            </h2>
            <p className="text-slate-400">
              You represent and warrant that you are at least 18 years old and
              have the legal authority to enter into this agreement. CrownPlay
              reserves the right to verify your age and identity at any time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              10. No Purchase Necessary
            </h2>
            <p className="text-slate-400">
              CrownPlay is a sweepstakes social casino where no purchase is
              necessary to play or win. While you may opt to purchase coins to
              play games, you can claim free sweepstakes coins daily and
              participate in all sweepstakes opportunities without spending
              money.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              11. Responsible Gaming
            </h2>
            <p className="text-slate-400">
              If you feel you may have a gambling problem, please contact the
              National Council on Problem Gambling at 1-800-522-4700. CrownPlay
              is committed to promoting responsible gaming.
            </p>
          </div>

          <div className="glass rounded-xl p-6 border border-yellow-400/20 bg-yellow-400/5">
            <p className="text-yellow-200 text-sm">
              By using CrownPlay, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service.
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
