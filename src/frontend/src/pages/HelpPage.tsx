import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: "Payments",
    q: "How do I send money to someone?",
    a: "Go to Transfers, enter the recipient's username, phone number, email, or user ID, enter the amount and an optional note, then tap Send. Money is transferred instantly to their wallet.",
  },
  {
    category: "Payments",
    q: "What are the transaction limits?",
    a: "Free accounts: $1,000/day, $5,000/month. Plus: $5,000/day. Pro: $10,000/day. Business: $50,000/day. Enterprise: custom limits. You can adjust limits in Settings > Transaction Limits.",
  },
  {
    category: "Payments",
    q: "Can I cancel a payment after sending?",
    a: "Payments are instant and generally cannot be cancelled once sent. If you sent money by mistake, contact the recipient and request a refund. For disputed transactions, contact support.",
  },
  {
    category: "Payments",
    q: "What currencies are supported?",
    a: "PayFlow supports USD, EUR, GBP, CAD, AUD, and JPY. Currency conversion happens automatically at live exchange rates when you send across currencies.",
  },
  {
    category: "Cards & Banks",
    q: "How do I add a card or bank account?",
    a: "Go to Payment Methods and click Add Payment Method. For cards, enter your card details (securely tokenized via Stripe). For bank accounts, connect via ACH. Funds auto-deposit to linked accounts when received.",
  },
  {
    category: "Cards & Banks",
    q: "Is my card information secure?",
    a: "Yes. PayFlow never stores raw card numbers. All card data is tokenized via Stripe, which is PCI DSS Level 1 certified — the highest level of payment security.",
  },
  {
    category: "Cards & Banks",
    q: "How do I freeze my card?",
    a: "Go to Payment Methods, select your card, and toggle the Freeze Card switch. Your card is instantly frozen and no transactions will be authorized. You can unfreeze at any time.",
  },
  {
    category: "Account",
    q: "How do I verify my phone number?",
    a: "In your Profile, tap Phone Number, enter your number, and we'll send a 6-digit verification code via SMS. Enter the code to verify. You can then send/receive money via your phone number.",
  },
  {
    category: "Account",
    q: "What is my User ID?",
    a: "Your User ID is a unique 8-character identifier visible in your Profile. You can share it with others so they can find and send money to you without needing your phone or email.",
  },
  {
    category: "Account",
    q: "How do I change my username?",
    a: "Go to Profile > Edit Profile. You can change your username once every 30 days. Usernames must be 3-20 characters and can only contain letters, numbers, and underscores.",
  },
  {
    category: "Referrals",
    q: "How do referral rewards work?",
    a: "Share your unique invite link from the Dashboard. When someone signs up using your link and makes their first payment, you automatically receive $5.00 credited to your wallet.",
  },
  {
    category: "Referrals",
    q: "Is there a limit to how many people I can refer?",
    a: "There's no limit! Invite as many friends as you want. Each successful referral earns you $5.00. Track your referrals and earnings from the Dashboard.",
  },
  {
    category: "Subscriptions",
    q: "What's included in each plan?",
    a: "Free: basic P2P transfers. Plus ($4.99/mo): higher limits, analytics. Pro ($9.99/mo): priority support, advanced analytics, no transaction fees. Business ($19.99/mo): multi-user, merchant tools. Enterprise: custom.",
  },
  {
    category: "Subscriptions",
    q: "Can I cancel my subscription?",
    a: "Yes. Go to Subscriptions and click Cancel Subscription. Your subscription remains active until the end of the current billing period. You won't be charged again.",
  },
  {
    category: "Security",
    q: "How do I enable two-factor authentication?",
    a: "Go to Settings > Security and toggle on Two-Factor Authentication. You'll be asked to verify via your phone number or an authenticator app each time you sign in from a new device.",
  },
  {
    category: "Security",
    q: "How do I report suspicious activity?",
    a: "Go to Settings > Security > Report an Issue, or contact support immediately at support@payflow.app. We recommend also freezing your linked cards from the Payment Methods page.",
  },
];

const CATEGORIES = [
  "All",
  "Payments",
  "Cards & Banks",
  "Account",
  "Referrals",
  "Subscriptions",
  "Security",
];

const GUIDES = [
  {
    icon: Zap,
    title: "Getting Started",
    desc: "Set up your wallet, add funds, and send your first payment in under 5 minutes.",
    badge: "Beginner",
  },
  {
    icon: Shield,
    title: "Security Best Practices",
    desc: "Enable 2FA, review active sessions, and keep your account safe.",
    badge: "Security",
  },
  {
    icon: BookOpen,
    title: "Understanding Fees",
    desc: "A full breakdown of transaction fees, FX rates, and subscription costs.",
    badge: "Finance",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = FAQS.filter((faq) => {
    const matchCat =
      activeCategory === "All" || faq.category === activeCategory;
    const matchSearch =
      !search ||
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8 max-w-3xl" data-ocid="help.page">
      {/* Header */}
      <div className="text-center py-6 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold">How can we help?</h1>
        <p className="text-muted-foreground">
          Find answers, guides, and support resources
        </p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="help.search_input"
          />
        </div>
      </div>

      {/* Quick guides */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Quick Guides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {GUIDES.map((guide) => (
            <Card
              key={guide.title}
              className="cursor-pointer hover:shadow-elevated transition-shadow"
              data-ocid="help.guide_card"
            >
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <guide.icon className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {guide.badge}
                  </Badge>
                </div>
                <p className="font-semibold text-sm">{guide.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {guide.desc}
                </p>
                <div className="flex items-center gap-1 text-xs text-primary">
                  Read guide <ChevronRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Frequently Asked Questions
        </h2>

        {/* Category filter */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none pb-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth shrink-0",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
              data-ocid={`help.category_filter.${cat.toLowerCase().replace(/ /g, "_")}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="pt-2 pb-2">
            {filtered.length === 0 ? (
              <div
                className="py-10 text-center text-muted-foreground"
                data-ocid="help.empty_state"
              >
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results for "{search}"</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filtered.map((faq, i) => (
                  <div key={faq.q} data-ocid={`help.faq_item.${i + 1}`}>
                    <button
                      type="button"
                      className="w-full text-left flex items-start justify-between gap-3 py-4 px-2 hover:bg-muted/30 rounded-lg transition-colors"
                      onClick={() =>
                        setExpanded(expanded === faq.q ? null : faq.q)
                      }
                      data-ocid={`help.faq_toggle.${i + 1}`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0 mt-0.5"
                        >
                          {faq.category}
                        </Badge>
                        <span className="text-sm font-medium">{faq.q}</span>
                      </div>
                      {expanded === faq.q ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                    </button>
                    {expanded === faq.q && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Contact support */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-base">Still need help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Our support team is available 24/7 via live chat or email.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="gap-2"
              data-ocid="help.chat_support_button"
            >
              <MessageCircle className="h-4 w-4" /> Live Chat
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              data-ocid="help.email_support_button"
            >
              <Mail className="h-4 w-4" /> Email Support
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              data-ocid="help.docs_button"
            >
              <ExternalLink className="h-4 w-4" /> Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
