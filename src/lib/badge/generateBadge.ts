import { getStorage } from 'firebase-admin/storage';

export function createBadgeSVG({ score, stars, partner, cohort }:{
  score:number; stars:number; partner:string; cohort:string;
}) {
  const starFill = '★'.repeat(Math.round(stars)).padEnd(5, '☆');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="418">
  <rect width="100%" height="100%" fill="#0B0F13"/>
  <text x="40" y="80" font-family="Inter, system-ui" font-size="28" fill="#8EEAFC">Gutcheck.AI</text>
  <text x="40" y="130" font-size="20" fill="#A3B3C2">${partner} • ${cohort}</text>
  <text x="40" y="210" font-size="68" fill="#E6F1F8">Score ${score}</text>
  <text x="40" y="270" font-size="36" fill="#8EEAFC">${starFill}</text>
  <text x="40" y="330" font-size="16" fill="#A3B3C2">Visibility Unlocked • Share your progress</text>
</svg>`;
}

export async function saveBadge({ userId, partnerId, cohortId, svg }:{
  userId:string; partnerId:string; cohortId:string; svg:string;
}) {
  const bucket = getStorage().bucket();
  const path = `badges/${partnerId}/${cohortId}/${userId}-${Date.now()}.svg`;
  await bucket.file(path).save(svg, {
    contentType: 'image/svg+xml',
    resumable: false,
    metadata: { cacheControl: 'public, max-age=31536000' }
  });
  // Signed URL (or you can use public URL pattern if bucket is public)
  const [url] = await bucket.file(path).getSignedUrl({
    action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 * 365
  });
  return { url };
}
