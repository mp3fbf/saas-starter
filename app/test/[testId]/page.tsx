import { Metadata } from 'next';

/**
 * Test page to verify if the PageProps constraint issue affects all dynamic routes
 */
type Props = {
  params: { testId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Test: ${params.testId}`,
  };
}

export default async function TestPage({ params }: Props) {
  return <div>Test ID: {params.testId}</div>;
} 