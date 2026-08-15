(function () {
  const REPO_OWNER = "jithinjbmc";
  const REPO_NAME = "origin-lab-website";
  const BRANCH = "main";
  const CONTENT_PATH = "content/publications";
  const listUrl = `https://data.jsdelivr.com/v1/packages/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}`;

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
  function renderItalics(str) {
    if (!str) return "";
    return str.replace(/(^|\s)_([^_]+)_(?=\s|$|,|\.|\()/g, "$1<em>$2</em>");
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function findPublicationFiles() {
    const res = await fetch(listUrl);
    if (!res.ok) throw new Error("Could not list repository files");
    const data = await res.json();

    function walk(entries, currentPath) {
      let found = [];
      for (const entry of entries) {
        const path = currentPath ? `${currentPath}/${entry.name}` : entry.name;
        if (entry.type === "directory" && entry.files) {
          found = found.concat(walk(entry.files, path));
        } else if (entry.type === "file" && path.startsWith(CONTENT_PATH + "/") && path.endsWith(".md")) {
          found.push(path);
        }
      }
      return found;
    }
    return walk(data.files, "");
  }

  async function fetchAndRender() {
    try {
      const files = await findPublicationFiles();
      if (!files.length) {
        container.innerHTML = '<p class="empty-state">No publications added yet.</p>';
        return;
      }

      const entries = await Promise.all(
        files.map(async (path) => {
          const url = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/${path}`;
          const res = await fetch(url);
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
