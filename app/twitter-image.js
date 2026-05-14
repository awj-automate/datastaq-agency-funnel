// Reuse the generated OG image for the Twitter/X card. Only the image function
// is re-exported — runtime/alt/size/contentType must be declared here as
// literals so Next.js can statically analyze them.
export { default } from './opengraph-image';

export const runtime = 'edge';
export const alt = 'Stop Burning 20+ Hours a Week on Client Reports — DataStaq AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
