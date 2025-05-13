const CONSTANTS = {
  MAX_ATTEMPTS: 3,
  ATTEMPT_KEY: 'insellyAttempts',
  ATTEMPT_DATE_KEY: 'insellyAttemptsStart',
  EXPIRY_DAYS: 7,
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  API_ENDPOINTS: {
    STAGE1: 'https://eightception.app.n8n.cloud/webhook/068d22da-80c2-4047-8275-08c8db1f3fb3',
    STAGE2: 'https://eightception.app.n8n.cloud/webhook/f83d85f9-7b2d-4b87-8bd1-aae76ea04efa',
    LEAD_FORM: 'https://eightception.app.n8n.cloud/webhook/0d489abf-c0b5-4d01-8994-50ce85747b77'
  }
};

const LOADER_JOKES = {
  STAGE1: [
    "Scanning selfies for market value...",
    "Counting hashtags like it's 2012...",
    "Evaluating influencer vibes...",
    "Checking how many posts are actually memes...",
    "Analyzing the algorithm's feelings about you...",
    "Looking at your bio like a talent scout...",
    "Zooming into your follower count...",
    "Detecting 'follow for follow' energy..."
  ],
  STAGE2: [
    "Diving into your reels for hidden gems...",
    "Evaluating engagement patterns...",
    "Calculating your Insta-worth with extra sauce...",
    "Running deep neural scan on your feed...",
    "Trying not to like your latest post accidentally...",
    "Checking your top fans list...",
    "Reviewing caption cleverness...",
    "Estimating influence per pixel..."
  ]
};

const Utils = {
  formatNumber(val) {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + "m";
    if (val >= 1_000) return (val / 1_000).toFixed(1).replace(/\.0$/, '') + "k";
    return val.toString();
  },

  formatUSD(val) {
    if (typeof val !== "number" || isNaN(val)) return "N/A";
    return "$" + new Intl.NumberFormat("en-US").format(val);
  },

  formatPercent(val) {
    if (typeof val !== "number" || isNaN(val)) return "N/A";
    return (val * 100).toFixed(2) + "%";
  },

  extractUsername(input) {
    const urlMatch = input.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/@?([a-zA-Z0-9._]{1,30})/i);
    const unameMatch = input.match(/^@?([a-zA-Z0-9._]{1,30})$/);
    if (urlMatch) return urlMatch[1].replace(/^@/, "").trim();
    if (unameMatch) return unameMatch[1].trim();
    return "";
  },

  clearStorage() {
    localStorage.removeItem(CONSTANTS.ATTEMPT_KEY);
    localStorage.removeItem(CONSTANTS.ATTEMPT_DATE_KEY);
  }
};

const Components = {
  createProfileHeader(data) {
    const $header = $('<div class="ig-calculator-profile-header"></div>');
    $header.append($('<img>', { src: data.image?.[0]?.url || '', alt: 'Profile picture' }));
    $header.append(this.createStat(data.postsQty, "posts"));
    $header.append(this.createStat(data.followers, "followers"));

    const $profile = $('<div class="ig-calculator-profile"></div>');
    $profile.append(
      $('<a>', {
        class: 'ig-calculator-profile-link',
        href: data.url,
        target: '_blank'
      }).text(data.accountName)
    );
    $profile.append($header);
    return $profile;
  },

  createStat(value, label) {
    return $('<div class="ig-calculator-profile-header-item"></div>')
      .append($('<div class="ig-calculator-profile-header-item-value"></div>').text(Utils.formatNumber(value)))
      .append($('<div class="ig-calculator-profile-header-item-label"></div>').text(label));
  },

  createFinalStats(data) {
    return $(`
      <div class="ig-calculator-stat-block">
        <p class="ig-calculator-valuation-title">Based on recent posts, the Instagram account worth can be around</p>
        <data class="ig-calculator-valuation" value="${data.accountValue}">${Utils.formatUSD(data.accountValue)}</data>
        <ul class="ig-calculator-metrics-list">
          <li class="ig-calculator-metrics-item">Potential Passive Income: <strong>${Utils.formatUSD(data.mounthlyIncome)}/month</strong></li>
          <li class="ig-calculator-metrics-item">Engaged Followers Rate: <strong>${Utils.formatPercent(data.engagedFollowers)}</strong></li>
          <li class="ig-calculator-metrics-item">Video Engagement Rate: <strong>${Utils.formatPercent(data.videoEngagement)}</strong></li>
        </ul>
        <p class="ig-calculator-metrics-subtext">Inselly AI is analyzing all your posts, your niche, and competitors to reveal better insights.</p>
        <ul class="ig-calculator-blurred-list">
          <li class="ig-calulator-stats-item">Average Engagement Rate in Your Niche: 🔒</li>
          <li class="ig-calulator-stats-item">Expected Account Value in 6 months: 🔒</li>
          <li class="ig-calulator-stats-item">Optimal Number of Promo Posts per Month: 🔒</li>
          <li class="ig-calulator-stats-item">Recommended Price of Promo Post on Account: 🔒</li>
        </ul>
      </div>
    `).append(this.createOverlay(data.initalRequestId, data.socialAccountId));
  },

  createOverlay(initalRequestId, socialAccountId) {
    return $(`
      <div class="ig-calculator-blur-overlay">
        <h4 class="ig-calculator-blur-heading">Want to see more stats?</h4>
      </div>
    `).append(this.createLeadForm(initalRequestId, socialAccountId));
  },

  createLeadForm(initalRequestId, socialAccountId) {
    const $form = $(`
      <div class="ig-calculator-lead-form">
        <input type="email" class="ig-calculator-input" placeholder="Your email">
        <label class="ig-calculator-terms-checkbox">
          <input type="checkbox" id="agreeTerms">
          I agree with the <a href="https://inselly.com/terms-and-conditions/" target="_blank">Terms</a> and
          <a href="https://inselly.com/privacy-policy/" target="_blank">Privacy Policy</a>.
        </label>
        <div class="ig-calculator-button">Get FREE Instagram Valuation</div>
        <p class="ig-calculator-form-status"></p>
      </div>
    `);

    this.setupLeadFormHandlers($form, initalRequestId, socialAccountId);
    return $form;
  },

  setupLeadFormHandlers($form, initalRequestId, socialAccountId) {
    const $button = $form.find('.ig-calculator-button');
    const $input = $form.find('input[type="email"]');
    const $status = $form.find('.ig-calculator-form-status');

    $button.on('click', () => {
      const email = $input.val().trim();
      const agreed = $('#agreeTerms').prop('checked');

      if (!CONSTANTS.EMAIL_REGEX.test(email)) {
        $status.text("Please enter a valid email address.");
        return;
      }

      if (!agreed) {
        $status.text("You must accept the terms.");
        return;
      }

      $button.text("Sending...").css('pointer-events', 'none');

      $.ajax({
        url: CONSTANTS.API_ENDPOINTS.LEAD_FORM,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, initalRequestId, socialAccountId })
      })
        .done((data) => {
          if (data.error) {
            $status.text(data.error);
            $input.prop('disabled', true);
            $form.find('#agreeTerms').prop('disabled', true);
            $button.remove();
          } else if (data.message) {
            $status.text("Thanks! We'll be in touch soon.");
            $input.prop('disabled', true);
            $button.remove();
            Utils.clearStorage();
          }
        })
        .fail((err) => {
          $status.text("Something went wrong. Try again.");
          $button.text("Get FREE Instagram Valuation").css('pointer-events', 'auto');
          console.error(err);
        });
    });
  }
};

class InstagramCalculator {
  constructor() {
    this.loaderInterval = null;
    this.attempts = parseInt(localStorage.getItem(CONSTANTS.ATTEMPT_KEY)) || 0;
    this.startDate = parseInt(localStorage.getItem(CONSTANTS.ATTEMPT_DATE_KEY)) || null;
    this.now = Date.now();
    this.daysSince = this.startDate ? (this.now - this.startDate) / (1000 * 60 * 60 * 24) : null;
  }

  init() {
    const $refInput = $('#form-referrer');
    const $input = $('#ig-calculator-username');
    const $button = $('#ig-calculator-submit');
    const $resultContainer = $('#ig-calculator-result');
    const $form = $('.ig-calculator-form');

    if ($refInput.length) {
      $refInput.val(document.referrer);
    }

    if (this.startDate && this.daysSince > CONSTANTS.EXPIRY_DAYS) {
      this.attempts = 0;
      Utils.clearStorage();
    }

    $button.on('click', () => this.handleButtonClick($input, $form, $resultContainer, $refInput));
  }

  handleButtonClick($input, $form, $resultContainer, $refInput) {
    if (this.attempts >= CONSTANTS.MAX_ATTEMPTS) {
      $form.remove();
      $resultContainer.html(`
        <h4 class="ig-calculator-blur-heading text-align-center">You've reached the free limit</h4>
        <p class="ig-calculator-metrics-subtext">Leave your email to get full access to your Instagram insights.</p>
      `).append(Components.createLeadForm(null, null));
      return;
    }

    const username = Utils.extractUsername($input.val().trim());
    if (!username) {
      $resultContainer.text("Invalid username format");
      return;
    }

    if (!this.startDate) {
      localStorage.setItem(CONSTANTS.ATTEMPT_DATE_KEY, this.now.toString());
    }

    this.attempts += 1;
    localStorage.setItem(CONSTANTS.ATTEMPT_KEY, this.attempts.toString());

    this.handleSubmit(username, $form, $resultContainer, $refInput);
  }

  showLoader(jokes, $resultContainer) {
    const $wrapper = $(
      `<div class="ig-calculator-loader">
        <span id="ig-calculator-loader-text" class="ig-calculator-show">${jokes[0]}</span>
      </div>`
    );
    $resultContainer.append($wrapper);
    this.startLoader($wrapper.find('#ig-calculator-loader-text'), jokes);
  }

  startLoader($el, jokes) {
    let prev = -1;
    this.loaderInterval = setInterval(() => {
      $el.removeClass("ig-calculator-show");
      setTimeout(() => {
        let i;
        do {
          i = Math.floor(Math.random() * jokes.length);
        } while (i === prev);
        prev = i;
        $el.text(jokes[i]).addClass("ig-calculator-show");
      }, 300);
    }, 2500);
  }

  stopLoader() {
    clearInterval(this.loaderInterval);
    this.loaderInterval = null;
  }

  async handleSubmit(username, $form, $resultContainer, $refInput) {
    $form.remove();
    $resultContainer.empty();
    this.showLoader(LOADER_JOKES.STAGE1, $resultContainer);

    try {
      const stage1Data = await this.fetchStage1(username, $refInput.val());
      this.stopLoader();
      $resultContainer.empty();
      $resultContainer.append(Components.createProfileHeader(stage1Data));
      this.showLoader(LOADER_JOKES.STAGE2, $resultContainer);

      const finalData = await this.fetchStage2(stage1Data);
      this.stopLoader();
      $resultContainer.find('.ig-calculator-loader').remove();
      $resultContainer.append(Components.createFinalStats(finalData));
    } catch (err) {
      this.stopLoader();
      console.error(err);
      $resultContainer.text("Something went wrong. Try again.");
    }
  }

  async fetchStage1(username, referrer) {
    const res = await $.ajax({
      url: CONSTANTS.API_ENDPOINTS.STAGE1,
      data: { username, referrer }
    });
    return res;
  }

  async fetchStage2(data) {
    const res = await $.ajax({
      url: CONSTANTS.API_ENDPOINTS.STAGE2,
      data: {
        account_id: data.socialAccountId,
        request_id: data.initalRequestId,
        scraped_at: data.scrapedAt
      }
    });
    return res;
  }
}

$(document).ready(() => {
  const calculator = new InstagramCalculator();
  calculator.init();
});