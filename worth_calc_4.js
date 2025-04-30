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

const MAX_ATTEMPTS = 3;
const ATTEMPT_KEY = 'insellyAttempts';
const ATTEMPT_DATE_KEY = 'insellyAttemptsStart';
const EXPIRY_DAYS = 7;


let loaderInterval;

let attempts = parseInt(localStorage.getItem(ATTEMPT_KEY)) || 0;
let startDate = parseInt(localStorage.getItem(ATTEMPT_DATE_KEY)) || null;

const now = Date.now();
const daysSince = startDate ? (now - startDate) / (1000 * 60 * 60 * 24) : null;

document.addEventListener("DOMContentLoaded", function () {
  const refInput = document.getElementById("form-referrer");
  const input = document.getElementById("ig-calculator-username");
  const button = document.getElementById("ig-calculator-submit");
  const resultContainer = document.getElementById("ig-calculator-result");
  const form = document.querySelector(".ig-calculator-form");

  if (refInput) {
    refInput.value = document.referrer;
  }

  if (startDate && daysSince > EXPIRY_DAYS) {
    attempts = 0;
    clearStorage();
  }

  button.addEventListener("click", () => {
    if (attempts >= MAX_ATTEMPTS) {
      if (form) form.remove();

      resultContainer.innerHTML = `
        <h4 class="ig-calculator-blur-heading text-align-center">You’ve reached the free limit</h4>
        <p class="ig-calculator-metrics-subtext">Leave your email to get full access to your Instagram insights.</p>
      `;
      resultContainer.appendChild(
        renderLeadForm(null, null)
      );
      return;
    }

    const username = extractUsername(input.value.trim());
    if (!username) {
      resultContainer.textContent = "Invalid username format";
      return;
    }

    if (!startDate) {
      localStorage.setItem(ATTEMPT_DATE_KEY, now.toString());
    }

    attempts += 1;
    localStorage.setItem(ATTEMPT_KEY, attempts.toString());

    handleSubmit(username);
  });

  function showLoader(jokes) {
    const wrapper = document.createElement("div");
    wrapper.className = "ig-calculator-loader";

    const text = document.createElement("span");
    text.id = "ig-calculator-loader-text";
    text.className = "ig-calculator-show";
    text.textContent = jokes[0];

    wrapper.appendChild(text);
    resultContainer.appendChild(wrapper);

    startLoader(text, jokes);
  }

  function startLoader(el, jokes) {
    let prev = -1;
    loaderInterval = setInterval(() => {
      el.classList.remove("ig-calculator-show");
      setTimeout(() => {
        let i;
        do {
          i = Math.floor(Math.random() * jokes.length);
        } while (i === prev);
        prev = i;
        el.textContent = jokes[i];
        el.classList.add("ig-calculator-show");
      }, 300);
    }, 2500);
  }

  function stopLoader() {
    clearInterval(loaderInterval);
    loaderInterval = null;
  }

  function extractUsername(input) {
    const urlMatch = input.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/@?([a-zA-Z0-9._]{1,30})/i);
    const unameMatch = input.match(/^@?([a-zA-Z0-9._]{1,30})$/);
    if (urlMatch) return urlMatch[1].replace(/^@/, "").trim();
    if (unameMatch) return unameMatch[1].trim();
    return "";
  }

  function handleSubmit(username) {
    const form = document.querySelector(".ig-calculator-form");
    if (form) form.remove();
    resultContainer.innerHTML = "";
    showLoader(jokesStage1);

    fetch(`https://eightception.app.n8n.cloud/webhook/068d22da-80c2-4047-8275-08c8db1f3fb3?username=${encodeURIComponent(username)}&referrer=${refInput.value}`)
      .then(async res => {
        const raw = await res.text();
        if (!res.ok) throw new Error(`Stage 1 error: ${res.status} - ${raw}`);
        return JSON.parse(raw);
      })
      .then(data => {
        stopLoader();
        renderHeader(data);
        showLoader(jokesStage2);

        fetch(`https://eightception.app.n8n.cloud/webhook/f83d85f9-7b2d-4b87-8bd1-aae76ea04efa?account_id=${data.socialAccountId}&request_id=${data.initalRequestId}&scraped_at=${data.scrapedAt}`)
          .then(async res => {
            const raw = await res.text();
            if (!res.ok) throw new Error(`Stage 2 error: ${res.status} - ${raw}`);
            return JSON.parse(raw);
          })
          .then(finalData => {
            stopLoader();
            renderHeader(finalData);
            renderFinalStats(finalData);
          })
          .catch((err) => {
            stopLoader();
            console.error(err);
            resultContainer.textContent = "Something went wrong. Try again.";
          });
      })
      .catch((err) => {
        stopLoader();
        console.error(err);
        resultContainer.textContent = "Something went wrong during account lookup.";
      });
  }

  function renderHeader(data) {
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
    resultContainer.innerHTML = "";
    resultContainer.appendChild(wrapper);
  }

  function renderFinalStats(data) {
    const block = document.createElement("div");
    block.className = "ig-calculator-stat-block";
    block.innerHTML = `
      <p class="ig-calculator-valuation-title">Based on recent posts, the Instagram account worth can be around</p>
      <data class="ig-calculator-valuation" value="${data.accountValue}">${formatUSD(data.accountValue)}</data>
      <ul class="ig-calculator-metrics-list">
        <li class="ig-calculator-metrics-item">Potential Passive Income: <strong>${formatUSD(data.mounthlyIncome)}/month</strong></li>
        <li class="ig-calculator-metrics-item">Engaged Followers Rate: <strong>${formatPercent(data.engagedFollowers)}</strong></li>
        <li class="ig-calculator-metrics-item">Video Engagement Rate: <strong>${formatPercent(data.videoEngagement)}</strong></li>
      </ul>
      <p class="ig-calculator-metrics-subtext">Inselly AI is analyzing all your posts, your niche, and competitors to reveal better insights.</p>
      <ul class="ig-calculator-blurred-list">
        <li class="ig-calulator-stats-item">Average Engagement Rate in Your Niche: 🔒</li>
        <li class="ig-calulator-stats-item">Expected Account Value in 6 months: 🔒</li>
        <li class="ig-calulator-stats-item">Optimal Number of Promo Posts per Month: 🔒</li>
        <li class="ig-calulator-stats-item">Recommended Price of Promo Post on Account: 🔒</li>
      </ul>
    `;
    resultContainer.appendChild(block);
    block.appendChild(renderOverlay(data.initalRequestId, data.socialAccountId));
  }

  function makeStat(value, label) {
    const block = document.createElement("div");
    block.className = "ig-calculator-profile-header-item";
    block.innerHTML = `
      <div class="ig-calculator-profile-header-item-value">${formatNumber(value)}</div>
      <div class="ig-calculator-profile-header-item-label">${label}</div>
    `;
    return block;
  }

  function renderOverlay(initalRequestId, socialAccountId) {
    const overlay = document.createElement("div");
    overlay.className = "ig-calculator-blur-overlay";
  
    const title = document.createElement("h4");
    title.className = "ig-calculator-blur-heading";
    title.textContent = "Want to see more stats?";

    const form = renderLeadForm(initalRequestId, socialAccountId);
  
    overlay.appendChild(title);
    overlay.appendChild(form);
  
    return overlay;
  }

  function renderLeadForm(initalRequestId, socialAccountId) {
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
        .then(res => res.json())
        .then((data) => {
          if (data.error) {
            status.textContent = data.error;
            input.disabled = true;
            checkbox.disabled = true;
            button.remove();
          } else if (data.message) {
            status.textContent = "Thanks! We'll be in touch soon.";
            input.disabled = true;
            button.remove();
            clearStorage();
          }
        })
        .catch((err) => {
          status.textContent = "Something went wrong. Try again.";
          button.textContent = "Get FREE Instagram Valuation";
          button.style.pointerEvents = "auto";
          console.error(err);
        });
    });

    const form = document.createElement("div");
    form.className = "ig-calculator-lead-form";
    form.appendChild(input);
    form.appendChild(checkbox);
    form.appendChild(button);
    form.appendChild(status);

    return form;
  }

  function clearStorage() {
    localStorage.removeItem(ATTEMPT_KEY);
    localStorage.removeItem(ATTEMPT_DATE_KEY);
  }

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
});