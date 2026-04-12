import { redirect } from 'next/navigation';
import { localizePath } from '@/lib/localePath';

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;
  redirect(localizePath(locale, '/tokens'));
}
