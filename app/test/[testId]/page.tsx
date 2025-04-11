import type { Metadata } from 'next';

/**
 * Test page to verify if the PageProps constraint issue affects all dynamic routes
 */
type TestIdParams = {
  testId: string;
};

export async function generateMetadata({ 
  params 
}: { 
  params: TestIdParams 
}): Promise<Metadata> {
  return {
    title: `Test: ${params.testId}`,
  };
}

export default function Page({ params }: { params: { testId: string } }) {
  return <div>Test ID: {params.testId}</div>;
} 