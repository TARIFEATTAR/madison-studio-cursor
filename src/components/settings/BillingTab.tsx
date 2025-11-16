import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CreditCard, Download, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { TIER_LIMITS, type TierId } from "@/config/subscriptionTiers";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSubscriptionData = useCallback(async (showLoading = false) => {
    if (!user) return;

    if (showLoading) {
      setIsRefreshing(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('[BillingTab] Calling get-subscription function...');
      const { data, error } = await supabase.functions.invoke('get-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      // Log for debugging
      console.log('[BillingTab] get-subscription response:', { 
        hasData: !!data, 
        hasError: !!error,
        subscription: data?.subscription ? 'present' : 'missing',
        paymentMethods: data?.paymentMethods?.length || 0,
        invoices: data?.invoices?.length || 0,
        error: error?.message || null
      });

      if (error) {
        console.error('[BillingTab] Function error:', error);
        // Handle specific error cases
        if (error.message?.includes('No organization') || error.message?.includes('not found')) {
          // User hasn't completed onboarding - this is OK
          setSubscription(null);
          setPaymentMethods([]);
          setInvoices([]);
          return;
        }
        throw error;
      }

      if (data) {
        setSubscription(data.subscription || null);
        setPaymentMethods(data.paymentMethods || []);
        setInvoices(data.invoices || []);
      } else {
        // No data returned - set empty state
        setSubscription(null);
        setPaymentMethods([]);
        setInvoices([]);
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      
      // Don't show error toast for expected cases (no subscription, no org)
      const errorMessage = error?.message || '';
      if (!errorMessage.includes('No organization') && !errorMessage.includes('No subscription')) {
      toast({
        title: "Error",
          description: errorMessage || "Failed to load subscription data",
        variant: "destructive",
      });
      } else {
        // Set empty data for expected cases
        setSubscription(null);
        setPaymentMethods([]);
        setInvoices([]);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Convert TIER_LIMITS to plan format for fallback
  const convertTiersToPlans = useCallback(() => {
    const tierIds: TierId[] = ['atelier', 'studio', 'maison'];
    return tierIds.map((tierId, index) => {
      const tier = TIER_LIMITS[tierId];
      // Generate features array from tier limits
      const features: string[] = [];
      
      if (tier.masterContent === -1) {
        features.push('Unlimited master content');
      } else {
        features.push(`${tier.masterContent} master content pieces/month`);
      }
      
      if (tier.derivatives === -1) {
        features.push('Unlimited derivatives');
      } else {
        features.push(`${tier.derivatives} derivative assets/month`);
      }
      
      features.push(`${tier.images} AI-generated images/month`);
      
      if (tier.organizations === -1) {
        features.push('Unlimited brands');
      } else {
        features.push(`${tier.organizations} brand${tier.organizations > 1 ? 's' : ''}, ${tier.productsPerOrg === -1 ? 'unlimited' : tier.productsPerOrg} products each`);
      }
      
      features.push(`Madison AI assistant (${tier.madisonQueries} queries/month)`);
      
      if (tier.teamMembers === -1) {
        features.push('Unlimited team members');
      } else {
        features.push(`${tier.teamMembers} team member${tier.teamMembers > 1 ? 's' : ''}`);
      }
      
      if (tier.marketplaceIntegration) {
        features.push('Shopify & Etsy integration');
      }
      
      if (tier.apiAccess) {
        features.push('API access');
      }
      
      if (tier.whiteLabel) {
        features.push('Full white-label included');
      }
      
      return {
        id: tierId, // Use tier ID as fallback ID
        name: tier.name,
        slug: tier.id,
        description: tier.displayName,
        price_monthly: tier.monthlyPrice,
        price_yearly: tier.annualPrice,
        features: features,
        is_active: true,
        sort_order: index + 1,
        stripe_price_id_monthly: null,
        stripe_price_id_yearly: null,
      };
    });
  }, []);

  // Initialize with fallback plans immediately so they show right away
  useEffect(() => {
    const fallbackPlans = convertTiersToPlans();
    setAvailablePlans(fallbackPlans);
    console.log('[BillingTab] Initialized with fallback plans:', fallbackPlans.length);
  }, [convertTiersToPlans]);

  useEffect(() => {
    fetchSubscriptionData();
    fetchAvailablePlans();
  }, [fetchSubscriptionData]);

  // Check for return from Stripe (checkout or portal)
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');
    
    if (sessionId) {
      // Successfully completed checkout
      setSearchParams({}); // Clear params
      fetchSubscriptionData();
      toast({
        title: "Success",
        description: "Your subscription has been updated successfully!",
      });
    } else if (canceled) {
      // Checkout was canceled
      setSearchParams({}); // Clear params
      toast({
        title: "Canceled",
        description: "Subscription update was canceled.",
        variant: "destructive",
      });
    }
  }, [searchParams, setSearchParams, fetchSubscriptionData]);

  // Refresh data when window regains focus (user returns from Stripe Portal)
  useEffect(() => {
    const handleFocus = () => {
      // Small delay to ensure webhook has processed
      setTimeout(() => {
        fetchSubscriptionData();
      }, 1000);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchSubscriptionData]);

  const handleRefresh = () => {
    fetchSubscriptionData(true);
    fetchAvailablePlans();
  };

  const fetchAvailablePlans = async () => {
    try {
      console.log('[BillingTab] Fetching plans from database...');
      const { data, error } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('[BillingTab] Database error fetching plans:', error);
        // Fall back to hardcoded tiers from config
        console.log('[BillingTab] Falling back to hardcoded tiers from subscriptionTiers.ts');
        const fallbackPlans = convertTiersToPlans();
        setAvailablePlans(fallbackPlans);
        toast({
          title: "Warning",
          description: "Using default pricing. Database connection issue.",
          variant: "default",
        });
        return;
      }
      
      console.log('[BillingTab] Plans loaded from database:', data?.length || 0, data);
      
      // If no plans loaded from database, use fallback
      if (!data || data.length === 0) {
        console.warn('[BillingTab] No plans in database, using fallback from subscriptionTiers.ts');
        const fallbackPlans = convertTiersToPlans();
        setAvailablePlans(fallbackPlans);
        toast({
          title: "Info",
          description: "Using default pricing tiers",
          variant: "default",
        });
      } else {
        setAvailablePlans(data);
      }
    } catch (error) {
      console.error('[BillingTab] Exception fetching plans:', error);
      // Always fall back to hardcoded tiers
      const fallbackPlans = convertTiersToPlans();
      setAvailablePlans(fallbackPlans);
      toast({
        title: "Info",
        description: "Using default pricing tiers",
        variant: "default",
      });
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!user) return;

    setIsLoadingCheckout(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Check if plan has Stripe Price IDs configured
      const plan = availablePlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      if (!plan.stripe_price_id_monthly) {
        throw new Error('Plan is not yet configured with Stripe. Please contact support.');
      }

      console.log('[BillingTab] Calling create-checkout-session with:', { planId, billingInterval: 'month' });
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, billingInterval: 'month' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('[BillingTab] Edge function response:', { data, error });

      if (error) {
        console.error('[BillingTab] Edge function error:', error);
        throw error;
      }

      if (!data) {
        console.error('[BillingTab] No data returned from edge function');
        throw new Error('No response from checkout service');
      }

      console.log('[BillingTab] Response data:', data);
      console.log('[BillingTab] Checkout URL:', data.url);

      if (data?.url) {
        console.log('[BillingTab] Redirecting to Stripe Checkout:', data.url);
        window.location.href = data.url;
      } else {
        console.error('[BillingTab] No URL in response. Full data:', JSON.stringify(data, null, 2));
        throw new Error(`No checkout URL returned. Response: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please ensure Stripe products are configured.",
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
  
  // Handle case where subscription exists but plan was deleted (orphaned subscription)
  const hasValidSubscription = subscription && currentPlan;

  return (
    <div className="space-y-6">
      {/* Subscription & Billing Title */}
      <div className="bg-parchment-white border border-charcoal/10 rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-ink-black">Subscription & Billing</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Current Plan Card */}
        {hasValidSubscription && (
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
        )}

        {/* Available Plans Section */}
        {availablePlans.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-lg font-serif text-ink-black mb-4">
              {hasValidSubscription ? 'Change Plan' : 'Choose Your Plan'}
            </h3>
            <p className="text-sm text-charcoal/70 mb-6">
              {hasValidSubscription 
                ? 'Upgrade or downgrade your subscription anytime'
                : subscription && !currentPlan
                ? 'Your subscription needs to be updated. Please select a new plan below.'
                : 'Select a plan to get started with Madison Studio'
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map((plan) => {
                const isCurrentPlan = currentPlan?.slug === plan.slug;
                const isHigherTier = currentPlan && 
                  ['atelier', 'studio', 'maison'].indexOf(plan.slug) > 
                  ['atelier', 'studio', 'maison'].indexOf(currentPlan.slug);
                
                // Handle orphaned subscription - don't disable buttons if plan is missing
                const shouldDisable = isCurrentPlan && !!currentPlan;
                
                return (
                  <div
                    key={plan.id}
                    className={`p-6 border-2 rounded-lg bg-parchment-white transition-all ${
                      isCurrentPlan 
                        ? 'border-aged-brass bg-gradient-to-br from-aged-brass/10 to-antique-gold/10' 
                        : 'border-charcoal/20 hover:border-aged-brass/50'
                    }`}
                  >
                    {isCurrentPlan && (
                      <Badge className="mb-3 bg-aged-brass text-parchment-white">
                        Current Plan
                      </Badge>
                    )}
                    <h4 className="font-serif text-xl text-ink-black mb-2">{plan.name}</h4>
                    {plan.description && (
                      <p className="text-sm text-charcoal/70 mb-4">{plan.description}</p>
                    )}
                    <div className="mb-4">
                      <span className="text-3xl font-semibold text-ink-black">
                        {formatCurrency(plan.price_monthly)}
                      </span>
                      <span className="text-charcoal/60">/month</span>
                      {plan.price_yearly && (
                        <p className="text-sm text-charcoal/60 mt-1">
                          or {formatCurrency(plan.price_yearly)}/year
                          <span className="text-green-600 ml-1">
                            (save {formatCurrency((plan.price_monthly * 12) - plan.price_yearly)})
                          </span>
                        </p>
                      )}
                    </div>
                    {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                      <ul className="text-sm text-charcoal/70 mb-4 space-y-2">
                        {plan.features.slice(0, 4).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-aged-brass mt-0.5">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button
                      variant={isCurrentPlan ? "outline" : "brass"}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoadingCheckout || shouldDisable}
                      className="w-full"
                    >
                      {isLoadingCheckout ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        hasValidSubscription ? (isHigherTier ? 'Upgrade' : 'Change Plan') : 'Subscribe'
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 border border-charcoal/20 rounded-lg bg-parchment-white">
            <p className="text-charcoal/70 mb-4">
              No subscription plans are currently available. Please contact support or refresh the page.
            </p>
            <Button onClick={() => { fetchAvailablePlans(); fetchSubscriptionData(); }} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Loading Plans
            </Button>
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
