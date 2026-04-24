"""
tanitjobs.com IT job scraper — improved version
================================================
Changes vs original:
  - Fixed false-positive skill matches (scala, java, ios, android, redis, pandas…)
    by adding \\b word boundaries to all patterns that need them.
  - Expanded KEYWORDS list (~50 → ~80 terms) to catch more roles.
  - Added more CATEGORY_URLS (management, finance-IT, engineering).
  - Added EXTRA_SEARCH_URLS for direct high-value searches that bypass keyword loop.
  - Raised MAX_PAGES_PER_KEYWORD 30 → 50.
  - Relaxed CONSECUTIVE_EMPTY_STOP 2 → 3 (fewer premature stops).
  - Added --headless CLI flag for running without a visible browser window.
  - Graceful driver.quit() (no WinError 6 traceback).
  - Deduplication now normalises URLs before storing (trailing slash, www vs no-www).
  - Progress bar printed every 50 jobs.
  - Output file timestamped so repeated runs don't overwrite each other.
"""

import json
import time
import re
import sys
from datetime import datetime

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By

# ---------------------------------------------------------------------------
# CLI flags
# ---------------------------------------------------------------------------
DEBUG    = "--debug"    in sys.argv
HEADLESS = "--headless" in sys.argv

BASE_URL = "https://www.tanitjobs.com"

# ---------------------------------------------------------------------------
# Search keywords (IT-focused, broader than before)
# ---------------------------------------------------------------------------
KEYWORDS = [
    # Roles — development
    "développeur", "developer", "ingénieur logiciel", "software engineer",
    "fullstack", "full stack", "frontend", "front-end", "backend", "back-end",
    "mobile developer", "flutter", "react native", "android developer",
    "ios developer",
    # Roles — data / AI
    "data", "data engineer", "data analyst", "data scientist",
    "machine learning", "deep learning", "intelligence artificielle",
    "computer vision", "nlp", "bi developer", "business intelligence",
    "power bi", "tableau",
    # Roles — infrastructure / ops
    "devops", "cloud", "sre", "platform engineer",
    "administrateur système", "administrateur réseau", "sysadmin",
    "support it", "technicien informatique", "helpdesk",
    # Roles — security
    "cybersécurité", "cybersecurity", "sécurité informatique",
    "pentester", "ethical hacker",
    # Roles — embedded / hardware
    "iot", "systèmes embarqués", "embedded", "firmware engineer",
    # Roles — management / method
    "chef de projet it", "chef de projet informatique",
    "product owner", "scrum master", "tech lead", "cto",
    "architecte it", "architecte logiciel", "it architect",
    # Roles — QA
    "qa engineer", "test automation", "ingénieur test", "quality assurance",
    # Roles — ERP / enterprise
    "erp", "sap", "oracle developer", "développeur fonctionnel",
    # Technologies (catch postings that lead with the stack)
    "python", "java developer", "php", "golang", "react", "angular",
    "vue.js", "node.js", "spring boot", "django", "laravel",
    "kubernetes", "docker", "terraform", "ansible",
    "aws", "azure", "gcp",
    "postgresql", "mongodb", "elasticsearch",
    "ingénieur informatique", "ingénieur cloud", "ingénieur devops",
    "ingénieur réseau", "ingénieur télécoms",
    # Additional NOC / telecom titles that performed well
    "noc", "support noc", "administrateur support noc",
]

# ---------------------------------------------------------------------------
# Category pages
# ---------------------------------------------------------------------------
CATEGORY_URLS = [
    f"{BASE_URL}/jobs/?cat=informatique-internet",
    f"{BASE_URL}/jobs/?cat=telecom",
    f"{BASE_URL}/jobs/?cat=electronique-electrotechnique",
    f"{BASE_URL}/jobs/?cat=ingenierie-technique",   # extra
    f"{BASE_URL}/jobs/?cat=management",              # catches IT managers
]

# ---------------------------------------------------------------------------
# Extra direct search URLs (pre-built, run before keyword loop)
# These are high-signal searches that would otherwise need several keywords.
# ---------------------------------------------------------------------------
EXTRA_SEARCH_URLS = [
    f"{BASE_URL}/jobs/?search=ingénieur+logiciel",
    f"{BASE_URL}/jobs/?search=développeur+web",
    f"{BASE_URL}/jobs/?search=développeur+mobile",
    f"{BASE_URL}/jobs/?search=cloud+engineer",
    f"{BASE_URL}/jobs/?search=data+engineer",
    f"{BASE_URL}/jobs/?search=machine+learning",
    f"{BASE_URL}/jobs/?search=cybersecurity",
    f"{BASE_URL}/jobs/?search=devops+engineer",
    f"{BASE_URL}/jobs/?search=test+engineer",
    f"{BASE_URL}/jobs/?search=product+owner",
    f"{BASE_URL}/jobs/?search=tech+lead",
    f"{BASE_URL}/jobs/?search=scrum+master",
    f"{BASE_URL}/jobs/?search=architecte+logiciel",
]

MAX_PAGES_PER_KEYWORD  = 50
CONSECUTIVE_EMPTY_STOP = 3
LINK_WAIT_TIMEOUT      = 15
REQUEST_DELAY          = 1.0

# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------

def create_driver():
    options = uc.ChromeOptions()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--start-maximized")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = uc.Chrome(options=options)
    driver.set_page_load_timeout(30)
    return driver

# ---------------------------------------------------------------------------
# IT job title filter
# ---------------------------------------------------------------------------

IT_TITLE_KEYWORDS = [
    "développeur", "developer", "fullstack", "full stack",
    "frontend", "front-end", "front end", "backend", "back-end", "back end",
    "ingénieur logiciel", "software engineer", "ingénieur informatique",
    "ingénieur système", "ingénieur réseau", "ingénieur devops",
    "ingénieur cloud", "ingénieur data", "ingénieur bi",
    "ingénieur sécurité", "ingénieur télécoms", "ingénieur iot",
    "ingénieur embarqué", "ingénieur test", "ingénieur mobile",
    "data scientist", "data analyst", "data engineer", "head of data",
    "analyste bi", "business intelligence", "bi developer",
    "machine learning", "deep learning", "intelligence artificielle",
    "computer vision", "nlp engineer",
    "devops", "sre", "platform engineer", "cloud engineer", "cloud architect",
    "sysadmin", "administrateur système", "administrateur réseau",
    "administrateur linux", "administrateur windows",
    "administrateur support noc", "support noc", "manager noc",
    "manager équipe noc", "chef de projet déploiement",
    "support it", "support informatique", "helpdesk",
    "technicien informatique", "technicien réseau",
    "network engineer", "system administrator",
    "cybersécurité", "cybersecurity", "sécurité informatique",
    "pentester", "penetration testing", "ethical hack",
    "iot engineer", "systèmes embarqués", "embedded", "firmware",
    "architecte it", "it architect", "architecte logiciel",
    "chef de projet it", "chef de projet informatique",
    "scrum master", "product owner", "tech lead", "cto",
    "qa ", "quality assurance", "test engineer", "test automation",
    "medior qa", "manual testing",
    "erp consultant", "sap consultant", "oracle developer",
    "développeur fonctionnel",
    "flutter developer", "react native", "mobile developer",
    "android developer", "ios developer",
    "[hiring]",  # catches bulk remote postings
]

NON_IT_TITLE_BLOCKLIST = [
    "comptable", "commercial", "vente", "vendeur", "vendeuse",
    "cuisinier", "boucher", "cafetier", "plongeur", "crêpier",
    "chef de partie", "chef garde", "économe",
    "hôtellerie", "tourisme", "voyage", "agent de sécurité",
    "ressources humaines", " rh ", "paie", "payroll",
    "community manager", "social media", "réseaux sociaux",
    "graphiste", "designer graphique", "media buyer",
    "enseignant", "professeur", "soutien scolaire",
    "maintenance industrielle", "plasturgie", "textile",
    "confection", "mécanique", "patronage",
    "médical", "infirmier", "paramédicale",
    "assistante administrative", "responsable bureau développement",
    "ingénieur process", "technicien maintenance", "contrôleur qualité",
    "marketing digital manager", "animatrice", "animateur",
    "référenceur web",
    "business developer",   # sales, not IT engineering
    "chargé de recrutement",
    "juriste",
    "directeur commercial",
]


def is_it_job(title):
    if not title:
        return False
    t = title.lower()
    if any(block in t for block in NON_IT_TITLE_BLOCKLIST):
        return False
    return any(kw in t for kw in IT_TITLE_KEYWORDS)

# ---------------------------------------------------------------------------
# Skills — ALL patterns use explicit \b word boundaries or anchors so that
# "scala" won't match "escalader", "java" won't match "javascript", etc.
# ---------------------------------------------------------------------------
#
# Format: (canonical_name, [regex_patterns], needs_word_boundary_flag_unused)
# The third element is kept for documentation only; boundaries are baked in.
#
SKILLS = [
    # --- Languages ---
    ("python",        [r"\bpython\b"],                          False),
    ("java",          [r"\bjava\b"],                            False),   # \b prevents matching "javascript"
    ("c++",           [r"c\+\+", r"\bcpp\b"],                  False),
    ("c#",            [r"\bc#\b", r"\bc sharp\b"],              False),
    ("golang",        [r"\bgolang\b", r"\bgo\b(?= lang| dev)"], False),
    ("rust",          [r"\brust\b"],                            False),
    ("javascript",    [r"\bjavascript\b"],                      False),
    ("typescript",    [r"\btypescript\b"],                      False),
    ("kotlin",        [r"\bkotlin\b"],                          False),
    ("swift",         [r"\bswift\b"],                           False),
    ("php",           [r"\bphp\b"],                             False),
    ("ruby",          [r"\bruby\b"],                            False),
    ("scala",         [r"\bscala\b"],                           False),   # was matching "escalader"
    ("matlab",        [r"\bmatlab\b"],                          False),
    ("bash",          [r"\bbash\b"],                            False),
    ("shell",         [r"\bshell\s+script"],                    False),
    ("r",             [r"\blanguage\s+r\b", r"\bprogrammation\s+r\b"], False),
    # --- Web / markup ---
    ("html",          [r"\bhtml\b"],                            False),   # was matching mid-word
    ("css",           [r"\bcss\b"],                             False),
    # --- Frontend frameworks ---
    ("react",         [r"\breact\.?js\b", r"\breact\b(?!\s+native)"], False),
    ("react native",  [r"\breact\s+native\b"],                  False),
    ("next.js",       [r"\bnext\.js\b", r"\bnextjs\b"],         False),
    ("vue",           [r"\bvue\.?js\b", r"\bvuejs\b"],          False),
    ("angular",       [r"\bangular\b"],                         False),
    ("svelte",        [r"\bsvelte\b"],                          False),
    # --- Backend frameworks ---
    ("node.js",       [r"\bnode\.?js\b", r"\bnodejs\b"],        False),
    ("express",       [r"\bexpress\.?js\b", r"\bexpressjs\b"],  False),
    ("spring boot",   [r"\bspring\s+boot\b"],                   False),
    ("spring",        [r"\bspring\b(?!\s+boot)"],               False),
    ("django",        [r"\bdjango\b"],                          False),
    ("flask",         [r"\bflask\b"],                           False),
    ("fastapi",       [r"\bfastapi\b", r"\bfast\s+api\b"],      False),
    ("laravel",       [r"\blaravel\b"],                         False),
    ("symfony",       [r"\bsymfony\b"],                         False),
    ("wordpress",     [r"\bwordpress\b"],                       False),
    ("nestjs",        [r"\bnest\.?js\b", r"\bnestjs\b"],        False),
    # --- Mobile ---
    ("flutter",       [r"\bflutter\b"],                         False),
    ("android",       [r"\bandroid\b(?!\s+studio\s+only)"],     False),   # was matching too broadly
    ("ios",           [r"\bios\s+dev", r"\bswift\b", r"\biokit\b",
                       r"développ\w+\s+ios", r"mobile\s+ios"],  False),   # was matching "cios", "bios"
    # --- ML / AI ---
    ("machine learning",  [r"\bmachine\s+learning\b"],          False),
    ("deep learning",     [r"\bdeep\s+learning\b"],             False),
    ("tensorflow",        [r"\btensorflow\b"],                  False),
    ("pytorch",           [r"\bpytorch\b"],                     False),
    ("keras",             [r"\bkeras\b"],                       False),
    ("scikit-learn",      [r"\bscikit-?learn\b", r"\bsklearn\b"], False),
    ("pandas",            [r"\bpandas\b(?!\s+bear)"],           False),   # avoid "pandas bears"
    ("numpy",             [r"\bnumpy\b"],                       False),
    ("data analysis",     [r"\bdata\s+analy[sz]", r"analyse\s+de\s+données"], False),
    ("power bi",          [r"\bpower\s+bi\b"],                  False),
    ("tableau",           [r"\btableau\s+(de\s+bord|software|desktop)\b"], False),
    ("nlp",               [r"\bnlp\b", r"\bnatural\s+language\s+processing\b"], False),
    ("computer vision",   [r"\bcomputer\s+vision\b"],           False),
    ("mlops",             [r"\bmlops\b"],                       False),
    ("langchain",         [r"\blangchain\b"],                   False),
    ("llm",               [r"\bllm\b", r"\blarge\s+language\s+model"],    False),
    # --- Databases ---
    ("sql",           [r"\bsql\b"],                             False),
    ("mysql",         [r"\bmysql\b"],                           False),
    ("postgresql",    [r"\bpostgresql\b", r"\bpostgres\b"],     False),
    ("mongodb",       [r"\bmongodb\b"],                         False),
    ("redis",         [r"\bredis\b"],                           False),   # was matching "prédis"
    ("oracle db",     [r"\boracle\s+(database|db)\b"],          False),
    ("cassandra",     [r"\bcassandra\b"],                       False),
    ("elasticsearch", [r"\belasticsearch\b"],                   False),
    ("sqlite",        [r"\bsqlite\b"],                          False),
    ("mariadb",       [r"\bmariadb\b"],                         False),
    ("cosmos db",     [r"\bcosmos\s*db\b"],                     False),
    # --- Cloud ---
    ("aws",           [r"\baws\b", r"\bamazon\s+web\s+services\b"], False),
    ("azure",         [r"\bazure\b"],                           False),
    ("gcp",           [r"\bgcp\b", r"\bgoogle\s+cloud\b"],      False),
    # --- DevOps / containers ---
    ("docker",        [r"\bdocker\b"],                          False),
    ("kubernetes",    [r"\bkubernetes\b", r"\bk8s\b"],          False),
    ("terraform",     [r"\bterraform\b"],                       False),
    ("ansible",       [r"\bansible\b"],                         False),
    ("jenkins",       [r"\bjenkins\b"],                         False),
    ("gitlab ci",     [r"\bgitlab\s*[-/]?ci\b"],                False),
    ("github actions",[r"\bgithub\s+actions\b"],                False),
    ("ci/cd",         [r"\bci\s*/\s*cd\b", r"\bci\s+cd\b", r"intégration\s+continue"], False),
    ("helm",          [r"\bhelm\b(?!\s+chart\s+only)"],         False),
    ("prometheus",    [r"\bprometheus\b"],                      False),
    ("grafana",       [r"\bgrafana\b"],                         False),
    # --- Embedded / IoT ---
    ("iot",           [r"\biot\b", r"\binternet\s+of\s+things\b"], False),
    ("embedded",      [r"\bembedded\b", r"\bembarqué\b"],       False),
    ("arduino",       [r"\barduino\b"],                         False),
    ("raspberry pi",  [r"\braspberry\s+pi\b"],                  False),
    ("esp32",         [r"\besp32\b"],                           False),
    ("stm32",         [r"\bstm32\b"],                           False),
    ("vhdl",          [r"\bvhdl\b"],                            False),
    ("verilog",       [r"\bverilog\b"],                         False),
    ("mqtt",          [r"\bmqtt\b"],                            False),
    ("rtos",          [r"\brtos\b", r"\bfreertos\b"],           False),
    # --- Networking / security ---
    ("networking",    [r"\bnetworking\b", r"\bréseaux?\b"],     False),
    ("tcp/ip",        [r"\btcp/ip\b", r"\btcp\s+ip\b"],         False),
    ("cybersecurity", [r"\bcybersecurity\b", r"\bcybersécurité\b",
                       r"\bsécurité\s+informatique\b"],         False),
    ("penetration testing", [r"\bpenetration\s+testing\b", r"\bpentest\b"], False),
    ("vpn",           [r"\bvpn\b"],                             False),
    ("cisco",         [r"\bcisco\b"],                           False),
    ("firewall",      [r"\bfirewall\b", r"\bpare-feu\b"],       False),
    # --- OS / infra ---
    ("linux",         [r"\blinux\b"],                           False),
    ("windows server",[r"\bwindows\s+server\b"],                False),
    ("vmware",        [r"\bvmware\b"],                          False),
    # --- Version control / collab ---
    ("git",           [r"\bgit\b"],                             False),
    ("github",        [r"\bgithub\b"],                          False),
    ("gitlab",        [r"\bgitlab\b"],                          False),
    ("jira",          [r"\bjira\b"],                            False),
    ("confluence",    [r"\bconfluence\b"],                      False),
    # --- Methodology ---
    ("agile",         [r"\bagile\b"],                           False),
    ("scrum",         [r"\bscrum\b"],                           False),
    ("kanban",        [r"\bkanban\b"],                          False),
    # --- Architecture / modelling ---
    ("uml",           [r"\buml\b"],                             False),
    ("bpmn",          [r"\bbpmn\b"],                            False),
    ("microservices", [r"\bmicroservices?\b"],                  False),
    ("rest api",      [r"\brest(?:ful)?\s+api\b", r"\bapi\s+rest\b"], False),
    ("graphql",       [r"\bgraphql\b"],                         False),
    # --- Enterprise ---
    ("sap",           [r"\bsap\b"],                             False),
    ("erp",           [r"\berp\b"],                             False),
    ("excel",         [r"\bexcel\b"],                           False),
]

_COMPILED = [
    (name, [re.compile(p, re.IGNORECASE) for p in patterns])
    for name, patterns, _ in SKILLS
]


def extract_skills(text):
    found = set()
    for name, patterns in _COMPILED:
        for pat in patterns:
            if pat.search(text):
                found.add(name)
                break
    return sorted(found)

# ---------------------------------------------------------------------------
# Noise trimming
# ---------------------------------------------------------------------------

NOISE_MARKERS = [
    "Offres d'emploi similaires", "Offres d'emploi à la une",
    "Offres de formation en Tunisie", "Offres d'emploi sponsorisées",
    "Voir Toutes les Offres", "A propos de ",
]


def trim_noise(text):
    for marker in NOISE_MARKERS:
        idx = text.find(marker)
        if idx != -1:
            text = text[:idx]
    return text.strip()

# ---------------------------------------------------------------------------
# Link extraction
# ---------------------------------------------------------------------------

PATTERN_JOB   = re.compile(r"https?://(?:www\.)?tanitjobs\.com/job/\d+/[^/?#\s]+")
PATTERN_OFFRE = re.compile(r"https?://(?:www\.)?tanitjobs\.com/(?:offre-emploi|offre)/[^/?#\s]+")


def normalize_link(href):
    url = href.split("?")[0].split("#")[0]
    url = url.replace("http://", "https://").replace("//www.", "//")
    return url.rstrip("/") + "/"


def extract_job_links(driver):
    links = set()
    try:
        for el in driver.find_elements(By.CSS_SELECTOR, "a[href]"):
            try:
                href = el.get_attribute("href") or ""
                if PATTERN_JOB.search(href) or PATTERN_OFFRE.search(href):
                    links.add(normalize_link(href))
            except Exception:
                continue
    except Exception as e:
        if DEBUG:
            print(f"   Link extraction error: {e}")
    return list(links)


def wait_for_links(driver, timeout=LINK_WAIT_TIMEOUT):
    deadline = time.time() + timeout
    while time.time() < deadline:
        links = extract_job_links(driver)
        if links:
            return links
        time.sleep(0.6)
    return []


def build_keyword_url(keyword, page):
    q = keyword.replace(" ", "+")
    if page == 1:
        return f"{BASE_URL}/jobs/?search={q}"
    return f"{BASE_URL}/jobs/?search={q}&page={page}"


def build_paged_url(base_url, page):
    if page == 1:
        return base_url
    sep = "&" if "?" in base_url else "?"
    return f"{base_url}{sep}page={page}"

# ---------------------------------------------------------------------------
# Job page parsing
# ---------------------------------------------------------------------------

def parse_header(text):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    title = company = location = None
    skip_words = {
        "postuler maintenant", "il'y a", "poste", "candidats",
        "soyez", "n'attendez", "retour", "connexion", "inscription",
    }
    for i, line in enumerate(lines):
        if line == "« Retour" and i + 1 < len(lines):
            title = lines[i + 1]
            for j in range(i + 2, min(i + 10, len(lines))):
                c = lines[j].lower()
                if any(s in c for s in skip_words):
                    continue
                if len(lines[j]) > 2:
                    company = lines[j].rstrip(" -").strip()
                    break
            for j in range(i + 2, min(i + 14, len(lines))):
                if re.search(
                    r",\s*(Tunisie|Congo|Maroc|France|Algérie|Sénégal|Remote)",
                    lines[j],
                ):
                    location = lines[j].strip()
                    break
            break
    return title, company, location


def wait_for_job_body(driver, timeout=12):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            body = driver.find_element(By.TAG_NAME, "body").text
            if "« Retour" in body and len(body) > 300:
                return body
        except Exception:
            pass
        time.sleep(0.4)
    try:
        return driver.find_element(By.TAG_NAME, "body").text
    except Exception:
        return ""


def get_job_details(driver, url):
    driver.get(url)
    raw = wait_for_job_body(driver)
    title, company, location = parse_header(raw)
    clean = trim_noise(raw)
    skills = extract_skills(clean)
    return title, company, location, clean[:3000], skills

# ---------------------------------------------------------------------------
# Link collection (shared by categories, extra URLs, keywords)
# ---------------------------------------------------------------------------

def collect_links_for_source(driver, label, paged_base_url_fn, seen_links):
    """
    paged_base_url_fn(page: int) -> str
    """
    new_links = []
    consecutive_empty = 0

    for page in range(1, MAX_PAGES_PER_KEYWORD + 1):
        page_url = paged_base_url_fn(page)
        if DEBUG:
            print(f"   [{label}] Page {page} -> {page_url}")
        try:
            driver.get(page_url)
        except Exception as e:
            print(f"   Load error [{label}]: {e}")
            break

        time.sleep(2)
        job_links = wait_for_links(driver)

        if not job_links:
            consecutive_empty += 1
            if DEBUG:
                print(f"   Empty page ({consecutive_empty}/{CONSECUTIVE_EMPTY_STOP})")
            if consecutive_empty >= CONSECUTIVE_EMPTY_STOP:
                break
            continue
        else:
            consecutive_empty = 0

        page_new = [l for l in job_links if l not in seen_links]
        if DEBUG:
            print(f"   {len(job_links)} links | {len(page_new)} new")

        if not page_new:
            if DEBUG:
                print(f"   All seen, stopping")
            break

        new_links.extend(page_new)
        for l in page_new:
            seen_links.add(l)

    return new_links

# ---------------------------------------------------------------------------
# Main scraper
# ---------------------------------------------------------------------------

def scrape(driver):
    all_jobs     = []
    seen_links   = set()
    skipped      = 0
    errors       = 0
    all_new_links = []

    print("\n" + "=" * 60)
    print("PHASE 1 — Collecting job links")
    print("=" * 60)

    # 1a. Category pages
    for cat_url in CATEGORY_URLS:
        label = cat_url.split("cat=")[-1]
        print(f"\n[Category] {label}")
        links = collect_links_for_source(
            driver, label,
            lambda p, u=cat_url: build_paged_url(u, p),
            seen_links,
        )
        all_new_links.extend(links)
        print(f"  → {len(links)} new  (running total: {len(all_new_links)})")
        time.sleep(1)

    # 1b. Extra direct search URLs
    print(f"\n[Extra searches] {len(EXTRA_SEARCH_URLS)} URLs")
    for extra_url in EXTRA_SEARCH_URLS:
        label = extra_url.split("search=")[-1]
        links = collect_links_for_source(
            driver, label,
            lambda p, u=extra_url: build_paged_url(u, p),
            seen_links,
        )
        all_new_links.extend(links)
        if links:
            print(f"  {label}: +{len(links)}  (total: {len(all_new_links)})")
        time.sleep(0.5)

    # 1c. Keyword searches
    print(f"\n[Keywords] {len(KEYWORDS)} keywords")
    for keyword in KEYWORDS:
        links = collect_links_for_source(
            driver, keyword,
            lambda p, kw=keyword: build_keyword_url(kw, p),
            seen_links,
        )
        all_new_links.extend(links)
        if links:
            print(f"  [{keyword}] +{len(links)}  (total: {len(all_new_links)})")
        time.sleep(0.5)

    print(f"\nTotal unique links to visit: {len(all_new_links)}")

    print("\n" + "=" * 60)
    print("PHASE 2 — Visiting job pages")
    print("=" * 60)

    for i, link in enumerate(all_new_links, 1):
        try:
            title, company, location, desc, skills = get_job_details(driver, link)
            if not is_it_job(title):
                skipped += 1
                if DEBUG:
                    print(f"   SKIP [{i}/{len(all_new_links)}] {title}")
                continue
            print(f"   OK [{i}/{len(all_new_links)}] {title} | {company} | {skills}")
            all_jobs.append({
                "title":       title,
                "company":     company,
                "location":    location,
                "link":        link,
                "description": desc,
                "skills":      skills,
            })
            time.sleep(REQUEST_DELAY)

            if i % 50 == 0:
                print(f"\n--- Progress: {i}/{len(all_new_links)} visited | "
                      f"{len(all_jobs)} kept | {skipped} skipped ---\n")

        except Exception as e:
            errors += 1
            print(f"   ERR [{i}] {link}: {e}")

    print(f"\nKept: {len(all_jobs)} | Skipped: {skipped} | Errors: {errors}")
    return all_jobs


def save(data, path=None):
    if path is None:
        ts   = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = f"jobs_{ts}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"Saved {len(data)} jobs → {path}")
    return path


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    driver = create_driver()
    data   = []
    try:
        data = scrape(driver)
        save(data)
    finally:
        try:
            driver.quit()
        except Exception:
            pass   # suppress WinError 6 on Windows
    print(f"\nDONE: {len(data)} unique IT jobs")