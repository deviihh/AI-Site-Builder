export const ENHANCE_PROMPT = `You are a prompt-enhancement assistant for an AI website builder.
Take the user's short website request and rewrite it as a clear, detailed brief in one or two paragraphs (maximum 120 words).
Describe the purpose of the site, the sections it should contain, the visual style and colour palette, and the key content.
Return ONLY the rewritten brief. No introduction, no markdown, no bullet points.`;

export const CODE_PROMPT = `You are an expert front-end developer.
Build a complete, responsive, modern website as a SINGLE HTML file.
Rules:
- Use Tailwind CSS through the CDN: <script src="https://cdn.tailwindcss.com"></script>
- Put any JavaScript in a <script> tag at the end of the body.
- Use real, sensible content for the topic. Do not use lorem ipsum.
- For every image on the page, do NOT invent an image URL yourself. Instead, write an <img> tag like this: <img data-img-query="grilled salmon" alt="Grilled salmon" class="...">
  The data-img-query value must be a SHORT, SIMPLE search term of 1-3 words, like a stock photo search: just the plain, common name of the subject (e.g. "masala dosa", "fish curry", "chicken biryani", "restaurant interior", "chef cooking"). Do NOT describe scenes, settings, plating or actions (no "in a pot", "on a plate", "with side view"). If a dish has a rare regional name, use the closest well-known common name instead (e.g. use "vegetable curry" instead of "avial"). Never reuse the same data-img-query twice on one page. Do not add a src attribute — leave that out entirely; it will be added automatically.
- For a map or "find us" section, do NOT use a Google Maps embed (an iframe with a maps.google.com/maps or google.com/maps/embed URL), since it requires a real paid API key and will show an error instead of a map. Instead, either use an OpenStreetMap embed like this: <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1,51.5,0.1,51.6&layer=mapnik" style="border:0" loading="lazy"></iframe> (adjust the bbox numbers to roughly match the business's city), or simply show the address as text with a "Get Directions" link to https://www.google.com/maps/search/?api=1&query=<the address, url-encoded>.
- Make the navigation links scroll smoothly to the sections on the page.
- Close every <style> tag with </style> and every <script> tag with </script>. Do not hide content behind scroll-reveal or fade-in effects: everything must be visible as soon as the page loads.
- Never write any JavaScript that sets, modifies, or guesses the \`src\` attribute of an image. The \`src\` will already be filled in correctly for every \`data-img-query\` image before the page is shown to users — do not add any code that touches it.
- Return ONLY raw HTML that starts with <!DOCTYPE html> and ends with </html>.
- Do NOT wrap the answer in markdown code fences and do NOT add any explanation.`;

// Pulls the HTML document out of the AI answer. Returns "" if it is not a full document.
export const cleanCode = (raw: string): string => {
  const lower = raw.toLowerCase();
  let start = lower.indexOf("<!doctype html");
  if (start === -1) start = lower.indexOf("<html");
  const endTag = lower.lastIndexOf("</html>");
  if (start === -1 || endTag === -1) return "";
  const html = repairStyleTags(raw.slice(start, endTag + "</html>".length).trim());
  return isWellFormed(html) ? html : "";
};

export const REVISE_PROMPT = `You are an expert front-end developer.
You will receive the CURRENT full HTML of a website and a change request from the user.
Apply the requested change and return the COMPLETE updated HTML file. Keep everything the user did not ask to change exactly as it is.
Rules:
- Keep using Tailwind CSS through the CDN.
- If the user says an image looks wrong, doesn't match, or asks for a different photo for something, you cannot see or change the actual photo directly. The only way to get a different photo is to rewrite that element's data-img-query to a new, more specific description of exactly what should be shown (e.g. change "fried rice with shrimp" to "close-up bowl of yangzhou fried rice with visible shrimp and peas, no people or scenery"). Do NOT repeat the same or a near-identical data-img-query, or the photo will not change.
- Return ONLY raw HTML that starts with <!DOCTYPE html> and ends with </html>.
- Do NOT wrap the answer in markdown code fences and do NOT add any explanation.`;

// Repairs a common AI mistake: a <style> block that is closed with </script>.
const repairStyleTags = (html: string): string =>
  html.replace(/(<style\b[^>]*>)([\s\S]*?)<\/script>/gi, (whole: string, open: string, content: string) =>
    /<\/style>|<script/i.test(content) ? whole : `${open}${content}</style>`
  );

// A browser treats everything after <style> or <script> as plain text until the matching closing tag.
// If that tag is missing, the whole page disappears, so such pages are rejected.
const isWellFormed = (html: string): boolean => {
  const lower = html.toLowerCase();
  const openTag = /<(script|style)\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = openTag.exec(html)) !== null) {
    const name = match[1].toLowerCase();
    const closeAt = lower.indexOf(`</${name}>`, openTag.lastIndex);
    if (closeAt === -1) return false;
    const content = html.slice(openTag.lastIndex, closeAt);
    if (name === "style" && /<\/?(script|body|head|section|div|nav|header|main|footer)\b/i.test(content)) {
      return false;
    }
    openTag.lastIndex = closeAt + name.length + 3;
  }
  return true;
};