const extractBtn = document.getElementById("extractBtn");
const contentDiv = document.getElementById("content");

// Create list item or "No data found"
function renderList(ulElement, items) {
  ulElement.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "No data found";
    li.style.fontStyle = "italic";
    ulElement.appendChild(li);
  } else {
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      li.onclick = () => navigator.clipboard.writeText(item);
      li.style.cursor = "pointer";
      li.onmouseover = () => li.style.textDecoration = "underline";
      li.onmouseout = () => li.style.textDecoration = "none";
      ulElement.appendChild(li);
    });
  }
}

extractBtn.addEventListener("click", () => {
  contentDiv.classList.remove("hidden");

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "EXTRACT_CONTACTS" },
      data => {
        if (!data) return;

        // Phones
        renderList(document.getElementById("phones"), data.phones);

        // Emails
        renderList(document.getElementById("emails"), data.emails);

        // Social media
        const socials = data.socialLinks;
        const socialNetworks = ["instagram", "facebook", "twitter", "linkedin", "discord", "youtube", "tiktok"];

        socialNetworks.forEach(net => {
          const block = document.getElementById(net + "Block");
          if (socials[net] && socials[net].length) {
            block.style.display = "block";
            renderList(document.getElementById(net), socials[net]);
          } else {
            block.style.display = "none";
          }
        });
      }
    );
  });
});
