const jokesStage1 = [
  "Scanning selfies for market value...",
  "Counting hashtags like it's 2012...",
  "Evaluating influencer vibes...",
  "Checking how many posts are actually memes...",
  "Analyzing the algorithm’s feelings about you...",
  "Looking at your bio like a talent scout...",
  "Zooming into your follower count...",
  "Detecting 'follow for follow' energy..."
];
const jokesStage2 = [
  "Diving into your reels for hidden gems...",
  "Evaluating engagement patterns...",
  "Calculating your Insta-worth with extra sauce...",
  "Running deep neural scan on your feed...",
  "Trying not to like your latest post accidentally...",
  "Checking your top fans list...",
  "Reviewing caption cleverness...",
  "Estimating influence per pixel..."
];

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("ig-calculator-dynamic-block");

  let loaderInterval;

  function clearContainer() {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  function createForm() {
    clearContainer();
    const wrapper = document.createElement("div");
    wrapper.className = "ig-calculator-form";

    const input = document.createElement("input");
    input.className = "ig-calculator-input";
    input.id = "ig-calculator-username";
    input.type = "text";
    input.placeholder = "@john.doe or https://instagram.com/john.doe";

    const button = document.createElement("div");
    button.className = "ig-calculator-button";
    button.id = "ig-calculator-submit";
    button.textContent = "Calculate Instagram Worth";

    const result = document.createElement("div");
    result.className = "ig-calculator-result";
    result.id = "ig-calculator-result";

    wrapper.appendChild(input);
    wrapper.appendChild(button);
    wrapper.appendChild(result);
    container.appendChild(wrapper);

    button.addEventListener("click", () => handleSubmit(input.value.trim()));
  }

  function showLoader(jokes) {
    const loaderWrapper = document.createElement("div");
    loaderWrapper.id = "ig-calculator-loader";
    loaderWrapper.className = "ig-calculator-loader";

    const loaderText = document.createElement("span");
    loaderText.id = "ig-calculator-loader-text";
    loaderText.className = "ig-calculator-show";
    loaderText.textContent = jokes[0];

    loaderWrapper.appendChild(loaderText);
    container.appendChild(loaderWrapper);
    startLoader(loaderText, jokes);
  }

  function startLoader(textEl, jokes) {
    let previousIndex = -1;
    loaderInterval = setInterval(() => {
      textEl.classList.remove("ig-calculator-show");
      setTimeout(() => {
        let index;
        do {
          index = Math.floor(Math.random() * jokes.length);
        } while (index === previousIndex);
        previousIndex = index;
        textEl.textContent = jokes[index];
        textEl.classList.add("ig-calculator-show");
      }, 300);
    }, 2500);
  }

  function stopLoader() {
    clearInterval(loaderInterval);
    loaderInterval = null;
  }

  function renderHeader(data) {
    clearContainer();
    const wrapper = document.createElement("div");
    wrapper.className = "ig-calculator-profile";

    const link = document.createElement("a");
    link.className = "ig-calculator-profile-link";
    link.href = data.url;
    link.target = "_blank";
    link.textContent = data.accountName;

    const header = document.createElement("div");
    header.className = "ig-calculator-profile-header";

    const avatar = document.createElement("img");
    avatar.src = data.image?.[0]?.url || "";
    avatar.alt = "Profile picture";
    header.appendChild(avatar);

    header.appendChild(makeStat(data.postsQty, "posts"));
    header.appendChild(makeStat(data.followers, "followers"));

    wrapper.appendChild(link);
    wrapper.appendChild(header);
    container.appendChild(wrapper);
  }

  function makeStat(value, label) {
    const block = document.createElement("div");
    block.className = "ig-calculator-profile-header-item";

    const val = document.createElement("div");
    val.className = "ig-calculator-profile-header-item-value";
    val.textContent = formatNumber(value);

    const lbl = document.createElement("div");
    lbl.className = "ig-calculator-profile-header-item-label";
    lbl.textContent = label;

    block.appendChild(val);
    block.appendChild(lbl);
    return block;
  }

  function renderFinalStats(data) {
    const statsWrapper = document.createElement("div");
    statsWrapper.className = "ig-calculator-stat-block";

    const title = document.createElement("p");
    title.className = "ig-calculator-valuation-title";
    title.textContent = "Based on recent posts, the Instagram account worth can be around";
    statsWrapper.appendChild(title);

    const value = document.createElement("data");
    value.className = "ig-calculator-valuation";
    value.value = data.accountValue;
    value.textContent = formatUSD(data.accountValue);
    statsWrapper.appendChild(value);

    const list = document.createElement("ul");
    list.className = "ig-calculator-metrics-list";

    list.innerHTML = `
      <li class="ig-calculator-metrics-item">Potential Passive Income: <strong>${formatUSD(data.mounthlyIncome)}/month</strong></li>
      <li class="ig-calculator-metrics-item">Engaged Followers Rate: <strong>${formatPercent(data.engagedFollowers)}</strong></li>
      <li class="ig-calculator-metrics-item">Video Engagement Rate: <strong>${formatPercent(data.videoEngagement)}</strong></li>
    `;
    statsWrapper.appendChild(list);

    const outro = document.createElement("p");
    outro.className = "ig-calculator-metrics-subtext";
    outro.textContent = "Inselly AI is analyzing all your posts, your niche, and competitors to reveal better insights.";
    statsWrapper.appendChild(outro);

    const blurred = document.createElement("ul");
    blurred.className = "ig-calculator-blurred-list";
    blurred.innerHTML = `
      <li class="ig-calulator-stats-item">Average Engagement Rate in Your Niche: 🔒</li>
      <li class="ig-calulator-stats-item">Expected Account Value in 6 months: 🔒</li>
      <li class="ig-calulator-stats-item">Optimal Number of Promo Posts per Month: 🔒</li>
      <li class="ig-calulator-stats-item">Recommended Price of Promo Post on Account: 🔒</li>
    `;
    statsWrapper.appendChild(blurred);

    statsWrapper.appendChild(renderLeadForm(data.initalRequestId, data.socialAccountId));
    container.appendChild(statsWrapper);
  }

  function renderLeadForm(initalRequestId, socialAccountId) {
    const overlay = document.createElement("div");
    overlay.className = "ig-calculator-blur-overlay";

    const title = document.createElement("h4");
    title.className = "ig-calculator-blur-heading";
    title.textContent = "Want to see more stats?";

    const input = document.createElement("input");
    input.type = "email";
    input.placeholder = "Your email";
    input.className = "ig-calculator-input";

    const checkbox = document.createElement("label");
    checkbox.className = "ig-calculator-terms-checkbox";
    checkbox.innerHTML = `
      <input type="checkbox" id="agreeTerms">
      I agree with the <a href="https://inselly.com/terms-and-conditions/" target="_blank">Terms</a> and
      <a href="https://inselly.com/privacy-policy/" target="_blank">Privacy Policy</a>.
    `;

    const button = document.createElement("div");
    button.className = "ig-calculator-button";
    button.textContent = "Get FREE Instagram Valuation";

    const status = document.createElement("p");
    status.className = "ig-calculator-form-status";

    button.addEventListener("click", () => {
      const email = input.value.trim();
      const agreed = document.getElementById("agreeTerms")?.checked;

      if (!email.includes("@")) {
        status.textContent = "Please enter a valid email.";
        return;
      }

      if (!agreed) {
        status.textContent = "You must accept the terms.";
        return;
      }

      button.textContent = "Sending...";
      button.style.pointerEvents = "none";

      fetch("https://eightception.app.n8n.cloud/webhook/0d489abf-c0b5-4d01-8994-50ce85747b77", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, initalRequestId, socialAccountId })
      })
        .then((res) => {
          if (res.ok) {
            status.textContent = "Thanks! We'll be in touch soon.";
            input.disabled = true;
            button.remove();
          } else throw new Error();
        })
        .catch(() => {
          status.textContent = "Something went wrong. Try again.";
          button.textContent = "Get FREE Instagram Valuation";
          button.style.pointerEvents = "auto";
        });
    });

    overlay.appendChild(title);
    overlay.appendChild(input);
    overlay.appendChild(checkbox);
    overlay.appendChild(button);
    overlay.appendChild(status);

    return overlay;
  }

  function showResult(data) {
    if (!data) {
      return;
    }
    stopLoader();
    renderHeader(data);
    renderFinalStats(data);
  }

  function extractUsername(input) {
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/@?([a-zA-Z0-9._]{1,30})/i;
    const usernameRegex = /^@?([a-zA-Z0-9._]{1,30})$/;
    const urlMatch = input.match(urlRegex);
    if (urlMatch) return urlMatch[1].replace(/^@/, "").trim();
    const unameMatch = input.match(usernameRegex);
    if (unameMatch) return unameMatch[1].trim();
    return "";
  }

  function handleSubmit(rawInput) {
    const username = extractUsername(rawInput);
    const resultBlock = document.getElementById("ig-calculator-result");

    if (!username) {
      if (resultBlock) resultBlock.textContent = "Invalid username format";
      return;
    }
    clearContainer();
    showLoader(jokesStage1);
  
    fetch(`https://eightception.app.n8n.cloud/webhook/068d22da-80c2-4047-8275-08c8db1f3fb3?username=${encodeURIComponent(username)}`)
      .then(async res => {
        const raw = await res.text();

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} - ${raw}`);
        }

        try {
          return JSON.parse(raw);
        } catch (jsonErr) {
          throw new Error(`JSON parse error: ${jsonErr.message}\nRaw: ${raw}`);
        }
      })
      .then(async data => {
        stopLoader();
        renderHeader(data);
        showLoader(jokesStage2);

        fetch(`https://eightception.app.n8n.cloud/webhook/f83d85f9-7b2d-4b87-8bd1-aae76ea04efa?account_id=${data.socialAccountId}&request_id=${data.initalRequestId}&scraped_at=${data.scrapedAt}`)
          .then(async res => {
            const raw = await res.text();

            if (!res.ok) {
              throw new Error(`Request failed: ${res.status} - ${raw}`);
            }

            try {
              return JSON.parse(raw);
            } catch (jsonErr) {
              throw new Error(`JSON parse error: ${jsonErr.message}\nRaw: ${raw}`);
            }
          })
          .catch((err) => {
            stopLoader();
            console.error("Request failed", err);
            alert("Something went wrong. Try again.");
            return;
          })
          .then(showResult);
      })
      .catch((err) => {
        stopLoader();
        createForm();
        console.error("Lookup error:", err);
        alert("Something went wrong during account lookup.");
      });
  }

  createForm();
});

// Format helpers
function formatNumber(val) {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + "m";
  if (val >= 1_000) return (val / 1_000).toFixed(1).replace(/\.0$/, '') + "k";
  return val.toString();
}
function formatUSD(val) {
  if (typeof val !== "number" || isNaN(val)) return "N/A";
  return "$" + new Intl.NumberFormat("en-US").format(val);
}
function formatPercent(val) {
  if (typeof val !== "number" || isNaN(val)) return "N/A";
  return (val * 100).toFixed(2) + "%";
}