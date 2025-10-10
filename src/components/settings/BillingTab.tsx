import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const billingHistory = [
  { date: "Jan 15, 2024", amount: "$99.00", status: "Paid" },
  { date: "Dec 15, 2023", amount: "$99.00", status: "Paid" },
  { date: "Nov 15, 2023", amount: "$99.00", status: "Paid" },
];

export function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Subscription & Billing Title */}
      <div className="bg-paper-light border border-cream-dark rounded-xl p-8">
        <h2 className="text-2xl font-serif text-charcoal mb-6">Subscription & Billing</h2>

        {/* Current Plan Card with Gradient */}
        <div className="bg-gradient-to-r from-brass to-brass-light p-8 rounded-lg mb-8">
          <p className="text-sm text-charcoal/90 mb-2">Current Plan</p>
          <h3 className="text-3xl font-serif text-charcoal mb-2">Premium</h3>
          <p className="text-sm text-charcoal/90 mb-6">$99/month • Renews on Feb 15, 2024</p>
          <Button className="bg-charcoal text-paper-light hover:bg-charcoal/90">
            Manage Plan
          </Button>
        </div>

        {/* Payment Method Section */}
        <div className="mb-8">
          <h3 className="text-lg font-serif text-charcoal mb-4">Payment Method</h3>
          <div className="flex items-center justify-between p-4 bg-paper border border-cream-dark rounded-lg">
            <div className="flex items-center gap-4">
              <div className="bg-charcoal text-paper-light px-3 py-1 rounded text-sm font-semibold">
                VISA
              </div>
              <div>
                <p className="text-charcoal font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-neutral-500">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-cream-dark">
              Update
            </Button>
          </div>
        </div>

        {/* Billing History */}
        <div>
          <h3 className="text-lg font-serif text-charcoal mb-4">Billing History</h3>
          <div className="space-y-3">
            {billingHistory.map((invoice) => (
              <div
                key={invoice.date}
                className="flex items-center justify-between p-4 bg-paper border border-cream-dark rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <p className="text-neutral-600 text-sm w-28">{invoice.date}</p>
                  <p className="text-charcoal font-medium">{invoice.amount}</p>
                  <Badge 
                    variant="outline" 
                    className="border-green-600 text-green-700"
                  >
                    {invoice.status}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-neutral-600">
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
