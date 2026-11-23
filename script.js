(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // Thème
  root.dataset.theme = store.get("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.getElementById("theme").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    store.set("theme", next);
  });

  // Pipeline du hero
  const steps = [...document.querySelectorAll("#pipeline li")];
  if (reduce) steps.forEach((s) => s.classList.add("done"));
  else steps.forEach((step, i) => setTimeout(() => {
    if (i > 0) steps[i - 1].classList.remove("now");
    step.classList.add("done", "now");
    if (i === steps.length - 1) setTimeout(() => step.classList.remove("now"), 700);
  }, 500 + i * 450));

  // Compétences : trajet d'une requête (contenu FR / EN)
  const layers = [
    { c: "--l1", fr: { n: "Interface", t: "Back-offices Angular, tableaux de bord React, application mobile React Native pour FitPass." }, en: { n: "Interface", t: "Angular back-offices, React dashboards, React Native mobile app for FitPass." }, k: ["Angular", "React", "React Native (Expo)", "TypeScript", "JavaScript ES6+", "HTML", "CSS", "Tailwind CSS"] },
    { c: "--l2", fr: { n: "Accès et sécurité", t: "Keycloak fédéré sur l'Active Directory, droits RBAC et jetons JWT chez Orange Finance. Traefik comme passerelle sur FitPass." }, en: { n: "Access and security", t: "Keycloak federated with Active Directory, RBAC and JWT tokens at Orange Finance. Traefik as API gateway on FitPass." }, k: ["Keycloak", "OAuth2", "JWT", "Active Directory", "Traefik", "Nginx"] },
    { c: "--l3", fr: { n: "APIs et logique métier", t: "Un monolithe Laravel, des APIs Spring Boot, une plateforme multi-tenant sous AdonisJS. Les entrées sont validées strictement avant d'atteindre le métier." }, en: { n: "APIs and business logic", t: "A Laravel monolith, Spring Boot APIs, a multi-tenant platform on AdonisJS. Inputs are strictly validated before reaching the business layer." }, k: ["Laravel", "Spring Boot", "AdonisJS", "Express", "Go (Gin)", "FastAPI", "OpenAPI / Swagger", "Joi", "Zod"] },
    { c: "--l4", fr: { n: "Événements et paiements", t: "Propagation asynchrone avec Kafka chez Caly, intégration de Wave et Orange Money, webhooks protégés contre les doublons." }, en: { n: "Events and payments", t: "Asynchronous propagation with Kafka at Caly, Wave and Orange Money integration, webhooks protected against duplicates." }, k: ["Apache Kafka", "RabbitMQ", "Webhooks", "Wave", "Orange Money"] },
    { c: "--l5", fr: { n: "Données", t: "Bases relationnelles sous forte contrainte d'intégrité, index pensés pour la performance, verrous d'idempotence Redis." }, en: { n: "Data", t: "Relational databases under strict integrity constraints, performance-minded indexing, Redis idempotency locks." }, k: ["PostgreSQL", "MySQL", "Redis", "Prisma", "TypeORM", "Lucid"] },
    { c: "--l6", fr: { n: "Plateforme et livraison", t: "Conteneurs, pipelines Jenkins, GitOps avec ArgoCD, déploiement sur OpenShift, infrastructure AWS EKS décrite en Terraform." }, en: { n: "Platform and delivery", t: "Containers, Jenkins pipelines, GitOps with ArgoCD, OpenShift deployment, AWS EKS infrastructure defined in Terraform." }, k: ["Docker", "Podman", "Kubernetes", "OpenShift", "Jenkins", "ArgoCD", "Terraform", "Ansible", "Linux", "Git"] }
  ];
  let lang = store.get("lang") === "en" ? "en" : "fr";
  let current = 0;
  const stops = document.getElementById("stops");
  const packet = document.getElementById("packet");
  const panel = document.getElementById("panel");
  const sendBtn = document.getElementById("send");
  const btns = layers.map((l, i) => {
    const li = document.createElement("li");
    li.style.setProperty("--c", `var(${l.c})`);
    li.innerHTML = `<button type="button" class="stop"><i></i><span></span></button>`;
    li.firstChild.addEventListener("click", () => show(i));
    stops.appendChild(li);
    return li.firstChild;
  });
  function show(i, animate = true) {
    current = i;
    btns.forEach((b, k) => {
      b.classList.toggle("on", k === i);
      b.lastChild.textContent = layers[k][lang].n;
    });
    const l = layers[i];
    panel.style.setProperty("--c", `var(${l.c})`);
    document.getElementById("p-title").textContent = l[lang].n;
    document.getElementById("p-text").textContent = l[lang].t;
    document.getElementById("p-chips").innerHTML = l.k.map((k) => `<li>${k}</li>`).join("");
    if (animate && !reduce) { panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap"); }
  }
  function placePacket(i) {
    const b = btns[i];
    packet.style.top = b.parentElement.offsetTop + b.offsetHeight / 2 - 7 + "px";
  }
  sendBtn.addEventListener("click", () => {
    sendBtn.disabled = true;
    packet.style.transition = "none"; placePacket(0); void packet.offsetWidth;
    packet.style.transition = ""; packet.classList.add("go");
    layers.forEach((_, i) => setTimeout(() => {
      placePacket(i); show(i);
      if (i === layers.length - 1) setTimeout(() => { packet.classList.remove("go"); sendBtn.disabled = false; }, 900);
    }, i * (reduce ? 500 : 900)));
  });

  // Langue FR / EN : le français reste dans le HTML, l'anglais est dans data-en
  const metaDesc = document.querySelector('meta[name="description"]');
  const meta = {
    fr: { title: document.title, desc: metaDesc.content },
    en: { title: "Thierno Birahim Gueye (Cyberoot) – Full Stack & DevOps Developer", desc: "Full Stack & DevOps developer based in Dakar. APIs, web and mobile interfaces, CI/CD pipelines, Kubernetes and OpenShift." }
  };
  const langBtn = document.getElementById("lang");
  function applyLang() {
    root.lang = lang;
    document.querySelectorAll("[data-en]").forEach((el) => {
      if (!el.dataset.fr) el.dataset.fr = el.textContent;
      el.textContent = lang === "en" ? el.dataset.en : el.dataset.fr;
    });
    document.title = meta[lang].title;
    metaDesc.content = meta[lang].desc;
    langBtn.textContent = lang === "en" ? "FR" : "EN";
    show(current, false);
  }
  langBtn.addEventListener("click", () => {
    lang = lang === "fr" ? "en" : "fr";
    store.set("lang", lang);
    applyLang();
  });
  applyLang();

  // Filtres de projets
  const chips = document.querySelectorAll(".chip");
  const items = document.querySelectorAll("#projects li");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.toggle("on", c === chip));
    const f = chip.dataset.f;
    items.forEach((li) => { li.hidden = f !== "all" && !li.dataset.cat.split(" ").includes(f); });
  }));

  // Lien actif du menu selon la section visible
  const links = [...document.querySelectorAll(".top nav a")];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  links.forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s) io.observe(s); });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
