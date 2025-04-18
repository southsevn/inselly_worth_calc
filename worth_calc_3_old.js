document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("ig-calculator-dynamic-block");

  let loaderInterval;

  const loaderMessages = [
    "Scanning selfies for market value...",
    "Converting likes into dollars...",
    "Checking how many posts are actually memes...",
    "Counting hashtags like it's 2012...",
    "Evaluating influencer vibes...",
    "Estimating your clout level...",
    "Running a vibe check on your grid...",
    "Detecting “follow for follow” energy...",
    "Measuring engagement per cat photo...",
    "Crunching numbers like it’s tax season...",
    "Guessing how much brands might pay you...",
    "Looking at your bio like a talent scout...",
    "Checking if your last reel went viral...",
    "Zooming into your follower count...",
    "Analyzing the algorithm’s feelings about you..."
  ];

  function clearContainer() {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  function createForm() {
    clearContainer();

    const formWrapper = document.createElement("div");
    formWrapper.id = "ig-calculator-form";
    formWrapper.className = "ig-calculator-form";

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

    formWrapper.appendChild(input);
    formWrapper.appendChild(button);
    formWrapper.appendChild(result);
    container.appendChild(formWrapper);

    button.addEventListener("click", () => handleSubmit(input.value.trim().toLowerCase()));
  }

  function showLoader() {
    clearContainer();

    const loaderWrapper = document.createElement("div");
    loaderWrapper.id = "ig-calculator-loader";
    loaderWrapper.className = "ig-calculator-loader";

    const loaderText = document.createElement("span");
    loaderText.id = "ig-calculator-loader-text";
    loaderText.className = "ig-calculator-show";
    loaderText.textContent = loaderMessages[0];

    loaderWrapper.appendChild(loaderText);
    container.appendChild(loaderWrapper);

    startLoader(loaderText);
  }

  function startLoader(textEl) {
    let previousIndex = -1;

    loaderInterval = setInterval(() => {
      textEl.classList.remove("ig-calculator-show");

      setTimeout(() => {
        let index;
        do {
          index = Math.floor(Math.random() * loaderMessages.length);
        } while (index === previousIndex);

        previousIndex = index;

        textEl.textContent = loaderMessages[index];
        textEl.classList.add("ig-calculator-show");
      }, 300);
    }, 2500);
  }

  function stopLoader() {
    clearInterval(loaderInterval);
    loaderInterval = null;
  }

  function showResult(response) {
    clearContainer();

    const formatNumber = (val) => {
      if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + "m";
      if (val >= 1_000) return (val / 1_000).toFixed(1).replace(/\.0$/, '') + "k";
      return val.toString();
    };

    const formatPercent = (val) => {
      if (typeof val !== "number" || isNaN(val)) return "N/A";
      return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val);
    };

    const formatUSD = (val) => {
      if (typeof val !== "number" || isNaN(val)) return "N/A";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val);
    };

    const wrapper = document.createElement("div");
    wrapper.className = "ig-calculator-profile";

    const link = document.createElement("a");
    link.className = "ig-calculator-profile-link";
    link.href = response.url;
    link.target = "_blank";
    link.textContent = response.accountName;

    const header = document.createElement("div");
    header.className = "ig-calculator-profile-header";

    const avatar = document.createElement("img");
    avatar.src = response.image?.[0]?.url || "";
    avatar.alt = "Profile picture";
    header.appendChild(avatar);

    const makeStatBlock = (value, label) => {
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
    };

    header.appendChild(makeStatBlock(response.postsQty, "posts"));
    header.appendChild(makeStatBlock(response.followers, "followers"));

    const stats = document.createElement("div");
    stats.className = "ig-calculator-stat-block";

    const valueTitle = document.createElement("p");
    valueTitle.className = "ig-calculator-valuation-title";
    valueTitle.textContent = "Based on recent posts, the Instagram account worth can be around";
    stats.appendChild(valueTitle);

    const additionStats = document.createElement("ul");
    additionStats.className = "ig-calculator-metrics-list"

    const value = document.createElement("data");
    value.value = response.accountValue;
    value.className = "ig-calculator-valuation";
    value.textContent = formatUSD(response.accountValue);
    stats.appendChild(value);

    const monthlyIncome = document.createElement("li");
    monthlyIncome.className = "ig-calculator-metrics-item";
    monthlyIncome.innerHTML = `Potential Passive Income: <strong>${formatUSD(response.mounthlyIncome)}/month</strong>`;

    const engaged = document.createElement("li");
    engaged.className = "ig-calculator-metrics-item";
    engaged.innerHTML = `Engaged Followers Rate: <strong>${formatPercent(response.engagedFollowers)}</strong>`;

    const video = document.createElement("li");
    video.className = "ig-calculator-metrics-item";
    video.innerHTML = `Video Engagement Rate: <strong>${formatPercent(response.videoEngagement)}</strong>`;

    additionStats.appendChild(monthlyIncome);
    additionStats.appendChild(engaged);
    additionStats.appendChild(video);

    stats.appendChild(additionStats);

    const subtitle = document.createElement("p");
    subtitle.className = "ig-calculator-metrics-subtext"
    subtitle.textContent =
      "Inselly AI is analyzing all your posts, your niche, and competitors to reveal better insights.";
    stats.appendChild(subtitle);

    wrapper.appendChild(link);
    wrapper.appendChild(header);
    wrapper.appendChild(stats);
    wrapper.appendChild(renderBlurBlock());
    wrapper.appendChild(renderLeadForm(response.initalRequestId, response.socialAccountId));
    container.appendChild(wrapper);
  }

  function renderBlurBlock() {
    const blurContent = document.createElement("ul");
    blurContent.className = "ig-calculator-blurred-list";
    blurContent.innerHTML = `
      <li class="ig-calulator-stats-item">Average Engagement Rate in Your Niche: 🔒</li>
      <li class="ig-calulator-stats-item">Expected Account Value in 6 months: 🔒</li>
      <li class="ig-calulator-stats-item">Optimal Number of Promo Posts per Month: 🔒</li>
      <li class="ig-calulator-stats-item">Recommended Price of Promo Post on Account: 🔒</li>
    `;

    return blurContent;
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

  function handleSubmit(rawInput) {
    const username = extractUsername(rawInput);
    const resultBlock = document.getElementById("ig-calculator-result");

    if (!username) {
      if (resultBlock) resultBlock.textContent = "Invalid username format";
      return;
    }

    showLoader();

    fetch(`https://eightception.app.n8n.cloud/webhook/83a56b18-23f1-4aac-8323-3a162b175a89?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        stopLoader();
        showResult(data);
      })
      .catch((err) => {
        console.error("Request failed", err);
        stopLoader();
        createForm();
        const errBlock = document.getElementById("ig-calculator-result");
        if (errBlock) errBlock.textContent = "Error retrieving data";
      });
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

  createForm();
});
