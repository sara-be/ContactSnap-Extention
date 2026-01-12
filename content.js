/* =========================
   HELPERS
========================= */
function unique(arr) {
  return [...new Set(arr)];
}

function textContainsContactHints(text) {
  const keywords = [
    "contact",
    "phone",
    "tel",
    "email",
    "support",
    "call",
    "reach",
    "address"
  ];
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

/* =========================
   FOOTER DETECTION
========================= */
function findFooterCandidates() {
  let elements = [];

  // Semantic footer
  elements.push(...document.querySelectorAll("footer"));

  // ARIA role
  elements.push(...document.querySelectorAll('[role="contentinfo"]'));

  // Common footer-like class/id
  const keywords = ["footer","site-footer","page-footer","bottom","colophon","copyright"];
  keywords.forEach(k => {
    elements.push(...document.querySelectorAll(`[class*="${k}" i], [id*="${k}" i]`));
  });

  return unique(elements);
}

/* Fallback: bottom 25% of page */
function findBottomSections() {
  const all = Array.from(document.querySelectorAll("div, section"));
  const pageHeight = document.documentElement.scrollHeight;
  return all.filter(el => el.getBoundingClientRect().bottom + window.scrollY > pageHeight * 0.7);
}

/* =========================
   GET FOOTER TEXT
========================= */
function getFooterText() {
  let candidates = findFooterCandidates();
  let valid = candidates.filter(el => textContainsContactHints(el.innerText));

  if (!valid.length) valid = findBottomSections().filter(el => textContainsContactHints(el.innerText));
  if (!valid.length) return document.body.innerText.slice(document.body.innerText.length * 0.75);

  return valid.map(el => el.innerText).join(" ");
}

/* =========================
   EXTRACT CONTACTS
========================= */
function extractContactsFromFooter() {
  const text = getFooterText();

  // Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  let emails = text.match(emailRegex) || [];

  // Phones
  const phoneRegex = /(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
  let phones = text.match(phoneRegex) || [];

  // Extract from <a href="mailto:..."> and <a href="tel:...">
  document.querySelectorAll("a[href]").forEach(a => {
    const href = a.href.toLowerCase();

    if (href.startsWith("mailto:")) {
      const email = a.href.replace(/^mailto:/i, "");
      if (email) emails.push(email);
    }

    if (href.startsWith("tel:")) {
      const phone = a.href.replace(/^tel:/i, "");
      if (phone) phones.push(phone);
    }
  });

  emails = unique(emails);
  phones = unique(phones);

  // Social links
  const socialLinks = { instagram: [], facebook: [], twitter: [], linkedin: [], discord: [], youtube: [], tiktok: [] };

  document.querySelectorAll("a[href]").forEach(a => {
    const href = a.href.toLowerCase();

    if (href.includes("instagram.com")) socialLinks.instagram.push(a.href);
    else if (href.includes("facebook.com")) socialLinks.facebook.push(a.href);
    else if (href.includes("twitter.com") || href.includes("x.com")) socialLinks.twitter.push(a.href);
    else if (href.includes("linkedin.com")) socialLinks.linkedin.push(a.href);
    else if (href.includes("discord.com")) socialLinks.discord.push(a.href);
    else if (href.includes("youtube.com")) socialLinks.youtube.push(a.href);
    else if (href.includes("tiktok.com")) socialLinks.tiktok.push(a.href);
  });

  Object.keys(socialLinks).forEach(k => socialLinks[k] = unique(socialLinks[k]));

  return { emails, phones, socialLinks };
}

/* =========================
   MESSAGE HANDLER
========================= */
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "EXTRACT_CONTACTS") {
    sendResponse(extractContactsFromFooter());
  }
});
