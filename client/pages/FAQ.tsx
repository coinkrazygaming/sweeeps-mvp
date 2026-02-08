import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqItems = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click 'Sign Up' on the home page, enter your email, create a password, and verify your email address. It takes less than 2 minutes!",
      },
      {
        q: "Is it free to play?",
        a: "Yes! You can claim daily free coins every single day without spending anything. You never have to make a purchase to play or win.",
      },
      {
        q: "What is the minimum age to play?",
        a: "You must be 18 years or older to create an account and play on CrownPlay.",
      },
    ],
  },
  {
    category: "Coins & Currency",
    questions: [
      {
        q: "What's the difference between Gold Coins and Sweepstakes Coins?",
        a: "Gold Coins are bonus coins purchased or earned. Sweepstakes Coins are earned through gameplay and can be redeemed for real prizes or cash.",
      },
      {
        q: "How do I get free Sweepstakes Coins?",
        a: "You can claim daily login bonuses every day. These give you free Sweepstakes Coins to play with, no purchase required.",
      },
      {
        q: "Can I buy coins?",
        a: "Yes, you can purchase Gold Coin packages in our store. You'll also receive bonus Sweepstakes Coins as part of the package.",
      },
    ],
  },
  {
    category: "Games & Playing",
    questions: [
      {
        q: "What games are available?",
        a: "We offer 10 exciting games including Slots (multiple varieties), Blackjack, Roulette, Dice Roll, Scratch Cards, and Keno.",
      },
      {
        q: "What are the odds of winning?",
        a: "Each game has a Return to Player (RTP) percentage displayed in the game details. This represents the average payout over time.",
      },
      {
        q: "Is the RNG fair and certified?",
        a: "Yes, our random number generation is cryptographically secure and uses industry-standard algorithms for fairness.",
      },
    ],
  },
  {
    category: "Redemptions & Withdrawals",
    questions: [
      {
        q: "How do I redeem my Sweepstakes Coins?",
        a: "Go to your profile, click 'Redeem', and select your redemption option. Your request will be processed within 3-5 business days.",
      },
      {
        q: "What's the minimum redemption amount?",
        a: "The minimum redemption amount is displayed in the redemption section. This may vary based on your location.",
      },
      {
        q: "How long does redemption take?",
        a: "Most redemptions are processed within 3-5 business days once approved by our team.",
      },
    ],
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "Is my information safe?",
        a: "Yes, we use industry-standard encryption and security practices to protect your personal and financial information.",
      },
      {
        q: "Can I change my password?",
        a: "Yes, you can change your password anytime in your profile settings. We'll send a confirmation email.",
      },
      {
        q: "What if I forget my password?",
        a: "Click 'Forgot Password' on the login page and follow the instructions. We'll send you a secure link to reset it.",
      },
    ],
  },
  {
    category: "Responsible Gaming",
    questions: [
      {
        q: "Does CrownPlay support responsible gaming?",
        a: "Absolutely. We provide tools to help you play responsibly including balance tracking and game limits.",
      },
      {
        q: "Can I limit my account?",
        a: "Yes, you can set daily spending limits or temporarily pause your account from your profile settings.",
      },
      {
        q: "Where can I get help with gambling concerns?",
        a: "If you have concerns about your gaming, please contact the National Council on Problem Gambling at 1-800-522-4700.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass rounded-lg border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition"
      >
        <span className="text-left font-semibold text-white">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-yellow-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-6 py-4 border-t border-white/10 bg-white/5">
          <p className="text-slate-400">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <Crown className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold gradient-gold bg-clip-text text-transparent">
                CrownPlay
              </span>
            </Link>
            <Button asChild variant="ghost" className="text-slate-300">
              <Link to="/">Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold mb-4 text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-slate-400">
          Find answers to common questions about CrownPlay
        </p>
      </section>

      {/* FAQ Content */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-12">
          {faqItems.map((category) => (
            <div key={category.category}>
              <h2 className="text-2xl font-bold text-white mb-6">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, idx) => (
                  <FAQItem key={idx} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-20 glass rounded-2xl p-12 border border-white/20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-slate-400 mb-6">
            Our support team is here to help. Reach out anytime.
          </p>
          <Button asChild className="gradient-gold">
            <a href="mailto:support@crownplay.com">Contact Support</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500 text-sm">
            © 2024 CrownPlay. All rights reserved. | Responsible Gaming | 18+
            Only
          </p>
        </div>
      </footer>
    </div>
  );
}
