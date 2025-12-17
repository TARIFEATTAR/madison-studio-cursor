import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { checkBrandReadiness, type BrandReadinessResult } from '@/lib/agents/brandReadinessCheck';
import { useOrganization } from '@/hooks/useOrganization';

export function BrandReadinessIndicator() {
  const { organization } = useOrganization();
  const [readiness, setReadiness] = useState<BrandReadinessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!organization?.id) return;

    const checkReadiness = async () => {
      setIsLoading(true);
      try {
        const result = await checkBrandReadiness(organization.id);
        setReadiness(result);
      } catch (error) {
        console.error('Failed to check brand readiness:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkReadiness();
  }, [organization?.id]);

  if (isLoading || !readiness) return null;

  // Don't show anything if brand is fully ready
  if (readiness.isReady && readiness.readinessScore >= 80) {
    return null;
  }

  // Show warning if not ready or partially ready
  const getIcon = () => {
    if (readiness.readinessScore >= 50) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  const getVariant = () => {
    if (readiness.readinessScore >= 50) {
      return 'default' as const;
    }
    return 'destructive' as const;
  };

  const getTitle = () => {
    if (readiness.readinessScore >= 50) {
      return 'Brand Setup Incomplete';
    }
    return 'Brand Setup Required';
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {getIcon()}
      <AlertTitle>{getTitle()}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p className="text-sm">
          Madison needs more information to generate accurate content for your brand.
          <span className="font-semibold ml-1">
            Readiness: {readiness.readinessScore}%
          </span>
        </p>

        {readiness.missingElements.length > 0 && (
          <div className="text-sm">
            <p className="font-medium">Missing:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              {readiness.missingElements.map((element, i) => (
                <li key={i}>{element}</li>
              ))}
            </ul>
          </div>
        )}

        {readiness.recommendations.length > 0 && (
          <div className="text-sm">
            <p className="font-medium">Recommendations:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              {readiness.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/settings?tab=brand-studio')}
            className="text-xs"
          >
            Complete Brand Setup
          </Button>
          {!readiness.hasBrandKnowledge && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/onboarding?step=brand-knowledge')}
              className="text-xs"
            >
              Upload Brand Docs
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
