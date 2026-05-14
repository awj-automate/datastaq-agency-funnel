export async function GET(request) {
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code') ||
    null;

  return Response.json({ country: country ? country.toUpperCase() : null });
}
