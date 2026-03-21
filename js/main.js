$(function () {
  const $window = $(window);
  const $menuBtn = $(".menu-btn");
  const $navLinks = $(".nav-links");
  const $navAnchors = $(".nav-links a, .rail-nav a");
  const $revealItems = $(".reveal");
  const sections = $("main section[id]").toArray();
  const companyMeta = {
    "THIQAH Business Services": {
      url: "https://www.thiqah.sa/",
      logo: "assets/imgs/thiqah.png"
    },
    "The Enterprise Company": {
      url: "https://www.inktankcommunications.com/index",
      logo: "assets/imgs/enterprise-company.jpg"
    },
    "Unicom Group": {
      url: "http://unicomg.com/",
      logo: "assets/imgs/unicomgroup.jpg"
    },
    "Victory Link": {
      url: "http://www.victorylink.com/",
      logo: "assets/imgs/victorylink.jpg"
    }
  };

  $("#year").text(new Date().getFullYear());

  $menuBtn.on("click", function () {
    const isOpen = $navLinks.hasClass("open");
    $navLinks.toggleClass("open", !isOpen);
    $menuBtn.attr("aria-expanded", String(!isOpen));
  });

  $("a[href^='#']").on("click", function (event) {
    const targetId = $(this).attr("href");
    const $target = $(targetId);

    if ($target.length) {
      event.preventDefault();
      $("html, body").animate({ scrollTop: $target.offset().top - 64 }, 450);
      $navLinks.removeClass("open");
      $menuBtn.attr("aria-expanded", "false");
    }
  });

  function revealOnScroll() {
    const triggerPoint = $window.scrollTop() + $window.height() * 0.88;
    $revealItems.each(function (index) {
      const $item = $(this);
      if (!$item.hasClass("is-visible") && $item.offset().top < triggerPoint) {
        setTimeout(function () {
          $item.addClass("is-visible");
        }, index * 70);
      }
    });
  }

  function updateActiveNav() {
    const currentY = $window.scrollTop() + 130;
    let currentId = "";

    sections.forEach(function (section) {
      if (section.offsetTop <= currentY) {
        currentId = section.id;
      }
    });

    $navAnchors.removeClass("active");
    if (currentId) {
      $navAnchors.filter("[href='#" + currentId + "']").addClass("active");
    }
  }

  function linkCompanyProfiles() {
    $(".timeline-org").each(function () {
      const $org = $(this);
      const originalText = $org.text().trim();

      if ($org.find("a").length) {
        return;
      }

      Object.keys(companyMeta).some(function (company) {
        if (originalText.startsWith(company)) {
          const suffix = originalText.slice(company.length);
          const meta = companyMeta[company];
          const link = "<a class=\"timeline-org-link\" href=\"" + meta.url + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + company + "</a>";
          $org.html(link + suffix);
          return true;
        }
        return false;
      });
    });
  }

  function setupAccordion($items, openedCount, key) {
    const api = {
      openAll: function () {},
      closeAll: function () {}
    };

    $items.each(function (index) {
      const $item = $(this);
      const $period = $item.children("span").first();
      const $title = $item.children("h3").first();
      const $org = $item.children(".timeline-org").first();

      const periodText = $period.length ? $period.text().trim() : "";
      const titleText = $title.length ? $title.text().trim() : "Details";
      const orgText = $org.length ? $org.text().trim() : "";
      const bodyId = key + "-body-" + index;
      const toggleId = key + "-toggle-" + index;

      let companyText = orgText;
      let companyLogoMarkup = "";
      Object.keys(companyMeta).some(function (company) {
        if (orgText.startsWith(company)) {
          const meta = companyMeta[company];
          const suffix = orgText.slice(company.length);
          companyText = company + suffix;
          if (meta.logo) {
            companyLogoMarkup = "<span class=\"item-toggle-logo-slot\"><img class=\"company-logo\" src=\"" + meta.logo + "\" alt=\"" + company + " logo\" /></span>";
          }
          return true;
        }
        return false;
      });

      const subMarkup =
        (periodText ? "<span class=\"item-toggle-period\">" + periodText + "</span>" : "") +
        (periodText && companyText ? "<span class=\"item-toggle-sep\">|</span>" : "") +
        (companyText ? "<span class=\"item-toggle-company-wrap\">" + companyText + "</span>" : "");

      const toggleMarkup =
        "<button class=\"item-toggle\" id=\"" + toggleId + "\" type=\"button\" aria-expanded=\"false\" aria-controls=\"" + bodyId + "\">" +
        "<span class=\"item-toggle-main\">" + titleText + "</span>" +
        "<span class=\"item-toggle-sub\">" + subMarkup + "</span>" +
        companyLogoMarkup +
        "<span class=\"item-toggle-icon\" aria-hidden=\"true\">+</span>" +
        "</button>";

      const $toggle = $(toggleMarkup);
      const $body = $("<div class='item-body' id='" + bodyId + "' role='region' aria-labelledby='" + toggleId + "'></div>");
      $body.append($item.children().detach());

      $body.children("span").first().remove();
      $body.children("h3").first().remove();

      $item.empty().append($toggle, $body);

      const shouldOpen = index < openedCount;
      $item.toggleClass("is-open", shouldOpen);
      $toggle.attr("aria-expanded", String(shouldOpen));
      if (!shouldOpen) {
        $body.hide();
      }

      $toggle.on("click", function () {
        const isOpen = $item.hasClass("is-open");
        $item.toggleClass("is-open", !isOpen);
        $toggle.attr("aria-expanded", String(!isOpen));
        $body.stop(true, true).slideToggle(220);
      });
    });

    api.openAll = function () {
      $items.each(function () {
        const $item = $(this);
        const $toggle = $item.find(".item-toggle").first();
        const $body = $item.find(".item-body").first();
        if (!$item.hasClass("is-open")) {
          $item.addClass("is-open");
          $toggle.attr("aria-expanded", "true");
          $body.stop(true, true).slideDown(180);
        }
      });
    };

    api.closeAll = function () {
      $items.each(function () {
        const $item = $(this);
        const $toggle = $item.find(".item-toggle").first();
        const $body = $item.find(".item-body").first();
        if ($item.hasClass("is-open")) {
          $item.removeClass("is-open");
          $toggle.attr("aria-expanded", "false");
          $body.stop(true, true).slideUp(180);
        }
      });
    };

    return api;
  }

  function setupProjectFilters() {
    const $filters = $("#project-filters");
    const $projects = $("#projects .project-item");
    const companies = [];
    const state = {
      company: "all"
    };

    $projects.each(function () {
      const $project = $(this);
      const company = $project.find(".timeline-org").first().text().trim();

      if (company) {
        $project.attr("data-company", company);
      }
      if (company && companies.indexOf(company) === -1) {
        companies.push(company);
      }
    });

    if (!$filters.length || !companies.length) {
      return;
    }

    const buttons = ["All"].concat(companies).map(function (company, index) {
      const isActive = index === 0 ? " active" : "";
      const filterValue = company === "All" ? "all" : company;
      return "<button class='project-filter-btn" + isActive + "' type='button' data-filter='" + filterValue + "'>" + company + "</button>";
    });
    $filters.html(buttons.join(""));

    function applyProjectFilters() {
      $projects.each(function () {
        const $project = $(this);
        const company = $project.attr("data-company") || "";
        const companyMatch = state.company === "all" || company === state.company;
        const shouldShow = companyMatch;
        $project.toggleClass("is-hidden", !shouldShow);
      });
    }

    $filters.on("click", ".project-filter-btn", function () {
      const $btn = $(this);
      state.company = $btn.data("filter");

      $filters.find(".project-filter-btn").removeClass("active");
      $btn.addClass("active");
      applyProjectFilters();
    });

    applyProjectFilters();
  }

  function setupTypewriter() {
    var $el = $("#hero-eyebrow");
    if (!$el.length) return;
    var text = $el.text().trim();
    $el.empty();
    var $cursor = $('<span class="typewriter-cursor"></span>');
    $el.append($cursor);
    var i = 0;
    function typeNext() {
      if (i < text.length) {
        $cursor.before(document.createTextNode(text[i]));
        i++;
        setTimeout(typeNext, 52);
      }
    }
    setTimeout(typeNext, 700);
  }

  function setupCountUp() {
    var $articles = $(".metrics article[data-countup]");
    if (!$articles.length) return;
    var triggered = new Set();

    function animateCounter($article) {
      var target = parseInt($article.attr("data-countup"), 10);
      var suffix = $article.attr("data-suffix") || "+";
      var $num = $article.find(".metric-num");
      var duration = 1600;
      var steps = 60;
      var step = 0;
      var timer = setInterval(function () {
        step++;
        var progress = step / steps;
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(target * eased);
        $num.text(target >= 1000 ? current.toLocaleString() + suffix : current + suffix);
        if (step >= steps) {
          clearInterval(timer);
          $num.text(target >= 1000 ? target.toLocaleString() + suffix : target + suffix);
        }
      }, duration / steps);
    }

    function checkCountUp() {
      var triggerPoint = $window.scrollTop() + $window.height() * 0.88;
      $articles.each(function () {
        if (!triggered.has(this) && $(this).offset().top < triggerPoint) {
          triggered.add(this);
          animateCounter($(this));
        }
      });
    }

    $window.on("scroll.countup", checkCountUp);
    checkCountUp();
  }

  $window.on("scroll", function () {
    revealOnScroll();
    updateActiveNav();
  });

  setupProjectFilters();
  const experienceAccordion = setupAccordion($("#experience .timeline-item"), 0, "experience");
  const projectsAccordion = setupAccordion($("#projects .project-item"), 0, "projects");

  $("#experience-expand").on("click", function () {
    experienceAccordion.openAll();
  });
  $("#experience-collapse").on("click", function () {
    experienceAccordion.closeAll();
  });
  $("#projects-expand").on("click", function () {
    projectsAccordion.openAll();
  });
  $("#projects-collapse").on("click", function () {
    projectsAccordion.closeAll();
  });

  revealOnScroll();
  updateActiveNav();
  linkCompanyProfiles();
  setupTypewriter();
  setupCountUp();
});
