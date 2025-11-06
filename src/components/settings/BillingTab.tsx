import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CreditCard, Download, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  subscription_plans: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price_monthly: number;
    price_yearly: number | null;
    features: string[];
  };
}

interface PaymentMethod {
  id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  invoice_pdf_url: string | null;
  hosted_invoice_url: string | null;
}

export function BillingTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
    fetchAvailablePlans();
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('get-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data) {
        setSubscription(data.subscription);
        setPaymentMethods(data.paymentMethods || []);
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setAvailablePlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!user) return;

    setIsLoadingCheckout(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, billingInterval: 'month' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
      setIsLoadingCheckout(false);
    }
  };

  const handleManagePlan = async () => {
    if (!user) return;

    setIsLoadingPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
      setIsLoadingPortal(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'active':
        return 'default';
      case 'past_due':
      case 'unpaid':
        return 'destructive';
      case 'canceled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-brass" />
      </div>
    );
  }

  const currentPlan = subscription?.subscription_plans;
  const defaultPaymentMethod = paymentMethods.find(pm => pm.is_default) || paymentMethods[0];

  return (
    <div className="space-y-6">
      {/* Subscription & Billing Title */}
      <div className="bg-parchment-white border border-charcoal/10 rounded-xl p-8">
        <h2 className="text-2xl font-serif text-ink-black mb-6">Subscription & Billing</h2>

        {/* Current Plan Card */}
        {currentPlan ? (
          <div className="bg-gradient-to-r from-aged-brass to-antique-gold p-8 rounded-lg mb-8">
            <p className="text-sm text-ink-black/90 mb-2">Current Plan</p>
            <h3 className="text-3xl font-serif text-ink-black mb-2">{currentPlan.name}</h3>
            <p className="text-sm text-ink-black/90 mb-2">
              {formatCurrency(currentPlan.price_monthly)}/month
              {subscription?.current_period_end && (
                <> • Renews on {formatDate(subscription.current_period_end)}</>
              )}
            </p>
            {subscription?.status === 'canceled' && (
              <p className="text-sm text-ink-black/70 mb-4">
                Your subscription will end on {formatDate(subscription.current_period_end)}
              </p>
            )}
            <Button 
              variant="default"
              onClick={handleManagePlan}
              disabled={isLoadingPortal}
              className="bg-ink-black text-parchment-white hover:bg-charcoal"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  Manage Plan
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="bg-warm-gray/10 border border-charcoal/20 p-8 rounded-lg mb-8">
            <p className="text-sm text-charcoal/70 mb-2">Current Plan</p>
            <h3 className="text-2xl font-serif text-ink-black mb-4">No Active Subscription</h3>
            <p className="text-sm text-charcoal/70 mb-6">
              Choose a plan to get started with Madison
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availablePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-6 border border-charcoal/20 rounded-lg bg-parchment-white"
                >
                  <h4 className="font-serif text-xl text-ink-black mb-2">{plan.name}</h4>
                  <p className="text-2xl font-semibold text-ink-black mb-4">
                    {formatCurrency(plan.price_monthly)}/mo
                  </p>
                  <Button
                    variant="brass"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoadingCheckout}
                    className="w-full"
                  >
                    {isLoadingCheckout ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Method Section */}
        {defaultPaymentMethod && (
          <div className="mb-8">
            <h3 className="text-lg font-serif text-ink-black mb-4">Payment Method</h3>
            <div className="flex items-center justify-between p-4 bg-parchment-white border border-charcoal/10 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="bg-ink-black text-parchment-white px-3 py-1 rounded text-sm font-semibold uppercase">
                  {defaultPaymentMethod.card_brand || 'CARD'}
                </div>
                <div>
                  <p className="text-ink-black font-medium">
                    •••• •••• •••• {defaultPaymentMethod.card_last4}
                  </p>
                  <p className="text-xs text-charcoal/60">
                    Expires {defaultPaymentMethod.card_exp_month}/{defaultPaymentMethod.card_exp_year}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManagePlan}
                disabled={isLoadingPortal}
              >
                Update
              </Button>
            </div>
          </div>
        )}

        {/* Billing History */}
        {invoices.length > 0 && (
          <div>
            <h3 className="text-lg font-serif text-ink-black mb-4">Billing History</h3>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-parchment-white border border-charcoal/10 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <p className="text-charcoal/70 text-sm w-28">
                      {formatDate(invoice.created_at)}
                    </p>
                    <p className="text-ink-black font-medium">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                  {invoice.invoice_pdf_url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(invoice.invoice_pdf_url!, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
