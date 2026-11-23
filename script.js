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
    { c: "--l1", fr: { n: "Interface & Frontend", t: "Interfaces réactives et back-offices intuitifs : applications mobiles temps réel (React Native), tableaux de bord de pilotage complexes sous React et portails d'entreprise sous Angular." }, en: { n: "Interface & Frontend", t: "Reactive interfaces & intuitive back-offices: real-time mobile apps (React Native), complex analytics dashboards in React, and enterprise admin portals in Angular." }, k: ["Angular", "React", "React Native (Expo)", "TypeScript", "JavaScript ES6+", "HTML5", "CSS3", "Tailwind CSS"] },
    { c: "--l2", fr: { n: "Accès & Sécurité", t: "Sécurisation enterprise-grade : fédération d'identités Keycloak sur Active Directory, contrôle d'accès fin RBAC et jetons JWT chez Orange Finance. Passerelles d'APIs résilientes avec Traefik et Nginx." }, en: { n: "Access & Security", t: "Enterprise-grade security: Keycloak identity federation with Active Directory, fine-grained RBAC and stateless JWT tokens at Orange Finance. Resilient API gateways with Traefik & Nginx." }, k: ["Keycloak", "OAuth2", "JWT", "Active Directory", "Traefik", "Nginx", "mTLS"] },
    { c: "--l3", fr: { n: "APIs & Logique Métier", t: "Architectures modulaires et scalables : plateformes SaaS multi-tenant sous AdonisJS, microservices Spring Boot et monolithes transactionnels Laravel. Validation stricte des flux et conformité OpenAPI. Événements asynchrones avec Kafka chez Caly et intégration de paiements mobiles (Wave, Orange Money)." }, en: { n: "APIs & Business Logic", t: "Modular, high-throughput architectures: multi-tenant SaaS platforms on AdonisJS, enterprise Spring Boot microservices, and transactional Laravel monoliths. Strict validation and OpenAPI compliance. Asynchronous events with Kafka at Caly and mobile money integrations (Wave, Orange Money)." }, k: ["Laravel", "Spring Boot", "AdonisJS", "Express", "Go (Gin)", "FastAPI", "OpenAPI / Swagger", "Joi", "Zod", "Apache Kafka", "RabbitMQ", "Webhooks", "Wave", "Orange Money"] },
    { c: "--l4", fr: { n: "Cloud & Infrastructure", t: "Infrastructure AWS provisionnée avec Terraform (VPC, sous-réseaux, passerelles NAT, Security Groups, cluster EKS) et configurée avec Ansible. Environnements versionnés et reproductibles." }, en: { n: "Cloud & Infrastructure", t: "AWS infrastructure provisioned with Terraform (VPC, subnets, NAT gateways, Security Groups, EKS cluster) and configured with Ansible. Versioned, reproducible environments." }, k: ["AWS", "EKS", "VPC", "Security Groups", "Terraform", "Ansible"] },
    { c: "--l5", fr: { n: "Données & Caching", t: "Modélisation relationnelle haute intégrité et optimisation des requêtes : bases PostgreSQL/MySQL sous fortes contraintes, indexation avancée et verrous d'idempotence Redis pour flux concurrents." }, en: { n: "Data & Caching", t: "High-integrity relational modeling and query optimization: strict PostgreSQL/MySQL constraints, advanced indexing, and Redis distributed idempotency locks for concurrent flows." }, k: ["PostgreSQL", "MySQL", "Redis", "Prisma", "TypeORM", "Lucid"] },
    { c: "--l6", fr: { n: "Plateforme & GitOps", t: "Industrialisation CI/CD et culture GitOps : conteneurisation Docker, orchestration Kubernetes et OpenShift, pipelines Jenkins et déploiements déclaratifs ArgoCD." }, en: { n: "Platform & GitOps", t: "Full-cycle CI/CD automation and GitOps: Docker containerization, Kubernetes & OpenShift orchestration, Jenkins pipelines, and declarative ArgoCD GitOps." }, k: ["Docker", "Podman", "Kubernetes", "OpenShift", "Jenkins", "ArgoCD", "Linux", "Git"] }
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
    en: { title: "Thierno Birahim Gueye (Cyberoot) – Full Stack & DevOps Engineer", desc: "Full Stack & DevOps engineer based in Dakar. Scalable web & mobile platforms, resilient Cloud architectures (AWS, Kubernetes, OpenShift), and automated GitOps CI/CD pipelines." }
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
