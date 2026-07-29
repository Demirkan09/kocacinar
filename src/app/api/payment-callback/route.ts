import { POST as handleCallbackPost, GET as handleCallbackGet } from '../payment/callback/route';

export async function POST(request: Request) {
  return handleCallbackPost(request);
}

export async function GET(request: Request) {
  return handleCallbackGet(request);
}