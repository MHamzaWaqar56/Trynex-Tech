import { PRICING } from "@/lib/data";
import { connectDB } from '@/lib/db';
import { Service as ServiceModel, type ServiceDocument } from '@/models/Service';
import { ok } from "@/lib/backend/route-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const services = await ServiceModel.find({}).sort({ order: 1, createdAt: -1 }).lean<ServiceDocument[]>();

  if (services.length === 0) {
    return ok({ plans: PRICING });
  }

  const plans = services.flatMap((service) =>
    (service.packages || []).map((plan: ServiceDocument['packages'][number], index: number) => ({
      id: `${service.slug}-${index}`,
      name: plan.name,
      price: plan.price,
      period: plan.period,
      description: plan.description,
      features: plan.features,
      highlighted: plan.highlighted,
      service: service.title,
      cta: plan.cta || 'Get Started',
    })),
  );

  return ok({ plans });
}