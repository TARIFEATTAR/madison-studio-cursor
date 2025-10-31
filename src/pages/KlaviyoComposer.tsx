import { KlaviyoEmailComposer } from "@/components/klaviyo/KlaviyoEmailComposer";
import { useOrganization } from "@/hooks/useOrganization";

export default function KlaviyoComposer() {
  const { organizationId } = useOrganization();

  return <KlaviyoEmailComposer organizationId={organizationId || undefined} />;
}
