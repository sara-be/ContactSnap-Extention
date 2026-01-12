const extractBtn = document.getElementById("extractBtn");
const content = document.getElementById("content");

function createItem(text) {
  const li = document.createElement("li");
  li.textContent = text;
  li.className = "cursor-pointer hover:underline";
  li.onclick = () => navigator.clipboard.writeText(text);
  return li;
}

extractBtn.addEventListener("click", () => {
  content.classList.remove("hidden");

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "EXTRACT_CONTACTS" },
      data => {
        if (!data) return;

        // Phones
        data.phones.forEach(p =>
          document.getElementById("phones").appendChild(createItem(p))
        );

        // Emails
        data.emails.forEach(e =>
          document.getElementById("emails").appendChild(createItem(e))
        );

        // Social media
        const socials = data.socialLinks;

        if (socials.instagram.length) {
          document.getElementById("instagramBlock").classList.remove("hidden");
          socials.instagram.forEach(link =>
            document.getElementById("instagram").appendChild(createItem(link))
          );
        }

        if (socials.facebook.length) {
          document.getElementById("facebookBlock").classList.remove("hidden");
          socials.facebook.forEach(link =>
            document.getElementById("facebook").appendChild(createItem(link))
          );
        }

        if (socials.twitter.length) {
          document.getElementById("twitterBlock").classList.remove("hidden");
          socials.twitter.forEach(link =>
            document.getElementById("twitter").appendChild(createItem(link))
          );
        }
      }
    );
  });
});
