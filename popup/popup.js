const extractBtn = document.getElementById("extractBtn");
const contentDiv = document.getElementById("content");

// Create list item or "No data found"
function renderList(ulElement, items) {
  ulElement.innerHTML = ""; // clear previous content

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "No data found";
    li.style.fontStyle = "italic";
    ulElement.appendChild(li);
  } else {
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;

      li.style.cursor = "pointer";
      li.style.position = "relative"; // for positioning tooltip
      li.onmouseover = () => li.style.textDecoration = "underline";
      li.onmouseout = () => li.style.textDecoration = "none";

      // Click to copy + show "Copied!" on the right
      li.addEventListener("click", () => {
        navigator.clipboard.writeText(item).then(() => {
          const tooltip = document.createElement("span");
          tooltip.textContent = "Copied!";
          tooltip.style.position = "absolute";
          tooltip.style.right = "8px";         // right side
          tooltip.style.top = "50%";           // vertically centered
          tooltip.style.transform = "translateY(-50%)";
          tooltip.style.background = "#06b6d4";
          tooltip.style.color = "white";
          tooltip.style.fontSize = "10px";
          tooltip.style.padding = "2px 6px";
          tooltip.style.borderRadius = "6px";
          tooltip.style.opacity = "0.9";
          tooltip.style.pointerEvents = "none";

          li.appendChild(tooltip);

          setTimeout(() => li.removeChild(tooltip), 800); // remove after 0.8s
        });
      });

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
