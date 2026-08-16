(function () {
  const REPO_OWNER = "jithinjbmc";
  const REPO_NAME = "origin-lab-website";
  const BRANCH = "main";
  const CONTENT_PATH = "content/publications";
  // GitHub's own raw CDN refreshes within minutes of a push, unlike
  // jsDelivr's branch-alias cache which can lag for hours.
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONTENT_PATH}?ref=${BRANCH}`;
  const rawBase = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${CONTENT_PATH}`;

  const container = document.getElementById("publications-list");
  const filterBar = document.getElementById("publications-filters");
  if (!container) return;

  // Very small YAML frontmatter parser: only needs to handle simple
  // "key: value" pairs as written by Decap CMS for this collection.
  function parseFrontmatter(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return null;
    const fields = {};
    match[1].split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      // strip surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      fields[key] = value;
    });
    return fields;
  }

  // Convert _text_ to <em>text</em> for scientific names, without
  // touching underscores that are part of a word (e.g. file_name).
  // Inline style guarantees visible italics regardless of how the
  // page's heading font falls back (the site's 'Lora' heading font
  // isn't actually loaded, so relying on em's default styling alone
  // isn't reliable here).
  function renderItalics(str) {
    if (!str) return "";
    return str.replace(
      /(^|\s)_([^_]+)_(?=\s|$|,|\.|\()/g,
      '$1<em style="font-style:italic;font-weight:inherit">$2</em>'
    );
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function findPublicationFiles() {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not list repository files");
    const data = await res.json();
    return data
      .filter((entry) => entry.type === "file" && entry.name.endsWith(".md"))
      .map((entry) => entry.name);
  }

  async function fetchAndRender() {
    try {
      const files = await findPublicationFiles();
      if (!files.length) {
        container.innerHTML = '<p class="empty-state">No publications added yet.</p>';
        return;
      }

      const entries = await Promise.all(
        files.map(async (name) => {
          const res = await fetch(`${rawBase}/${name}`, { cache: "no-store" });
          const raw = await res.text();
          return parseFrontmatter(raw);
        })
      );

      const publications = entries
        .filter((e) => e && e.status !== "Draft")
        .sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));

      renderFilters(publications);
      renderList(publications, "All");
    } catch (err) {
      console.error("Failed to load publications:", err);
      container.innerHTML =
        '<p class="empty-state">Publications could not be loaded right now. Please try refreshing, or check back shortly.</p>';
    }
  }

  function renderFilters(publications) {
    if (!filterBar) return;
    const themes = Array.from(new Set(publications.map((p) => p.theme).filter(Boolean)));
    filterBar.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.className = "filter active";
    allBtn.type = "button";
    allBtn.textContent = "All";
    allBtn.dataset.filter = "All";
    filterBar.appendChild(allBtn);
    themes.forEach((theme) => {
      const btn = document.createElement("button");
      btn.className = "filter";
      btn.type = "button";
      btn.textContent = theme;
      btn.dataset.filter = theme;
      filterBar.appendChild(btn);
    });
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      filterBar.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderList(publications, btn.dataset.filter);
    });
  }

  function renderList(publications, filter) {
    const filtered =
      filter === "All" ? publications : publications.filter((p) => p.theme === filter);

    if (!filtered.length) {
      container.innerHTML = '<p class="empty-state">No publications in this category yet.</p>';
      return;
    }

    container.innerHTML = filtered
      .map((p) => {
        const doiLink = p.doi
          ? `<a class="external" href="https://doi.org/${escapeHtml(p.doi)}" target="_blank" rel="noopener noreferrer">View source ↗</a>`
          : "";
        const volPages = [p.volume, p.pages].filter(Boolean).join(": ");
        return `<article class="publication">
          <div class="pub-year">${escapeHtml(p.year || "")}</div>
          <div>
            <h3>${renderItalics(p.title)}</h3>
            <p>${escapeHtml(p.authors || "")}</p>
            <p>${escapeHtml(p.journal || "")}${volPages ? " " + escapeHtml(volPages) : ""}</p>
            ${p.doi ? `<p>DOI: ${escapeHtml(p.doi)}</p>` : ""}
          </div>
          ${doiLink}
        </article>`;
      })
      .join("");
  }

  fetchAndRender();
})();
