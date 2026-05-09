export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(process.env.INDEXNOW_KEY || '', {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}