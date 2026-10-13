// Кнопки «Скачать»: без скрипта ведут на страницу последнего выпуска, со
// скриптом — прямо на файл (APK / DMG) с размером и номером версии.
// Телефон на Android — первой показываем кнопку APK.
// Сведения о выпуске — из latest.json рядом (кладёт scripts/release.sh в
// репозитории приложения), а не из API GitHub: у того лимит 60 запросов в час.
const MANIFEST = new URL("latest.json", document.currentScript?.src || location.href);

(async () => {
  const buttons = [...document.querySelectorAll("[data-asset]")];
  if (/Android/i.test(navigator.userAgent)) {
    for (const btn of buttons) btn.classList.toggle("primary", btn.dataset.asset === ".apk");
    const apk = buttons.find((b) => b.dataset.asset === ".apk");
    apk?.parentElement?.prepend(apk);
  }

  try {
    const res = await fetch(MANIFEST, { cache: "no-cache" });
    if (!res.ok) return;
    const release = await res.json();
    const version = String(release.tag_name || "").replace(/^v/i, "");
    for (const btn of buttons) {
      const asset = (release.assets || []).find((a) => a.name.toLowerCase().endsWith(btn.dataset.asset));
      if (!asset) continue;
      btn.href = asset.browser_download_url;
      const size = btn.querySelector("small");
      if (size) size.textContent = Math.round(asset.size / 1e6) + " " + (document.documentElement.lang === "ru" ? "МБ" : "MB");
    }
    for (const el of document.querySelectorAll("[data-version]")) {
      if (version) el.textContent = el.dataset.version.replace("{v}", version);
    }
  } catch {
    // нет сети или GitHub недоступен — остаются ссылки на страницу выпуска
  }
})();
