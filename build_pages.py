#!/usr/bin/env python3
"""One-time generator for Hermes Roofing secondary pages.
WARNING: several generated pages have since been edited directly (green guarantee,
action images, drone copy). Sync those edits into this script before regenerating.
Run: python3 build_pages.py  (outputs static HTML into the repo; commit the results).
"""

import html

SITE = "https://hermesroofing.com"

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{site}{path}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Public+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="{site}{path}">
{extra_head}
</head>
<body>
<script>document.documentElement.classList.add('js')</script>
<a class="skip-link" href="#main">Skip to content</a>

<div class="utility">
  <div class="wrap">
    <span class="hours">Mon&ndash;Sat 7am&ndash;5pm &middot; Insured &amp; bonded &middot; Free drone inspections</span>
    <a href="tel:15125227310">(512) 522-7310</a>
  </div>
</div>

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">Hermes Roofing Co.</a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="nav" aria-label="Open menu">&#9776;</button>
    <nav class="nav" id="nav" aria-label="Main">
      <a href="/services"{cur_services}>Services</a>
      <a href="/storm-insurance"{cur_storm}>Storm &amp; insurance</a>
      <a href="/our-crew"{cur_crew}>Our crew</a>
      <a href="/gallery"{cur_gallery}>Work</a>
      <a href="/#reviews">Reviews</a>
      <a href="/#faq">FAQ</a>
      <a href="/contact"{cur_contact}>Contact</a>
      <a class="btn btn-solid" href="/contact">Get a free inspection</a>
    </nav>
  </div>
</header>

<main id="main">
"""

FOOT = """</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <p class="footer-brand">Hermes Roofing Co.</p>
        <p class="footer-about">Family-owned, insured, and bonded. Roofing Austin and Central Texas since 2009 &mdash; repairs, replacements, and storm restoration done right.</p>
      </div>
      <div>
        <h3>Services</h3>
        <ul>
          <li><a href="/services#residential">Residential roofing</a></li>
          <li><a href="/services#commercial">Commercial roofing</a></li>
          <li><a href="/services#replacement">Roof replacement</a></li>
          <li><a href="/services#metal">Standing seam metal</a></li>
          <li><a href="/storm-insurance">Storm &amp; insurance</a></li>
          <li><a href="/services#certifications">Roof certifications</a></li>
        </ul>
      </div>
      <div>
        <h3>Contact</h3>
        <ul>
          <li><a href="tel:15125227310">(512) 522-7310</a></li>
          <li><a href="mailto:peter@hermesrenovations.com">peter@hermesrenovations.com</a></li>
          <li><a href="https://maps.app.goo.gl/3Mt3FMg3XMXFxuTL6" rel="noopener" target="_blank">701 Tillery St Ste 12, Austin, TX 78702</a></li>
          <li>Mon&ndash;Sat 7am&ndash;5pm</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; <span id="year">2026</span> Hermes Roofing Company &middot; Austin, TX</span>
      <span><a href="/service-areas/austin">Austin</a> &middot; <a href="/service-areas/georgetown">Georgetown</a> &middot; <a href="/service-areas/round-rock">Round Rock</a> &middot; <a href="/service-areas/driftwood">Driftwood</a> &middot; <a href="/service-areas/marble-falls">Marble Falls</a> &middot; <a href="/service-areas/temple">Temple</a> &middot; <a href="/service-areas/killeen">Killeen</a></span>
    </div>
  </div>
</footer>

<div class="trust-bar" role="complementary" aria-label="Company credentials">
  <div class="wrap">
    <div class="trust-item"><span class="big">A+</span><span class="small">BBB accredited</span></div>
    <div class="trust-item"><span class="big">5.0</span><span class="small">Google rating</span></div>
    <div class="trust-item trust-summary"><span class="big">A+ BBB &middot; 5.0 &#9733; &middot; 17 yrs</span><span class="small">2-yr leak-free guarantee</span></div>
    <div class="trust-item"><span class="big">17 yrs</span><span class="small">in Central Texas</span></div>
    <div class="trust-item"><span class="big">2-yr</span><span class="small">leak-free guarantee</span></div>
    <a class="trust-call" href="tel:15125227310">Call now</a>
  </div>
</div>

<script src="/js/main.js" defer></script>
</body>
</html>
"""

CTA_BAND = """
<section class="section">
  <div class="wrap">
    <div class="cta-band">
      <h2>Ready for an honest look at your roof?</h2>
      <p>Free inspection, clear recommendation, no pressure either way.</p>
      <a class="btn btn-cream" href="/contact">Get a free inspection</a>
    </div>
  </div>
</section>
"""


def page(path, title, desc, body, current=None, extra_head=""):
    cur = {k: "" for k in ["services", "storm", "crew", "gallery", "contact"]}
    if current:
        cur[current] = ' aria-current="page"'
    return HEAD.format(
        title=html.escape(title), desc=html.escape(desc), site=SITE, path=path,
        extra_head=extra_head,
        cur_services=cur["services"], cur_storm=cur["storm"], cur_crew=cur["crew"],
        cur_gallery=cur["gallery"], cur_contact=cur["contact"],
    ) + body + FOOT


pages = {}

# ---------------- Services ----------------
pages["services.html"] = page(
    "/services",
    "Roofing Services in Austin & Central Texas | Hermes Roofing Company",
    "Residential and commercial roofing in Austin: roof repair, replacement, new construction, standing seam metal, inspections, certifications, and preventive maintenance.",
    """
<section class="page-hero">
  <div class="wrap">
    <h1>Roofing services for Austin &amp; Central Texas</h1>
    <p>From a single leak to a full replacement, every job gets the same crew, the same care, and the same 2-year leak-free guarantee.</p>
  </div>
</section>
<section class="section">
  <div class="wrap service-grid">
    <div class="service-card" id="residential">
      <h2>Residential roofing</h2>
      <p>Repairs, full replacements, and new roof construction for Central Texas homes, built with quality materials suited to our climate.</p>
      <ul><li>Composition &amp; architectural shingles</li><li>Wood shingle &amp; shake</li><li>Impact-rated options for hail country</li></ul>
    </div>
    <div class="service-card" id="commercial">
      <h2>Commercial roofing</h2>
      <p>Flat and low-slope systems for businesses and multi-family properties, installed and maintained by an experienced local crew.</p>
      <ul><li>TPO &amp; EPDM membranes</li><li>Modified bitumen</li><li>Maintenance programs</li></ul>
    </div>
    <div class="service-card" id="replacement">
      <h2>Roof replacement</h2>
      <p>A clear walkthrough of materials, cost, and warranty options, then a clean, efficient install. Most homes are completed in one day.</p>
    </div>
    <div class="service-card" id="repairs">
      <h2>Roof repairs</h2>
      <p>Leaks, wind damage, worn shingles, flashing, and more, fixed quickly and guaranteed leak-free for a minimum of 2 years.</p>
    </div>
    <div class="service-card" id="metal">
      <h2>Standing seam metal roofs</h2>
      <p>Long-life metal roofing with clean lines and excellent performance in Texas heat and hail. A great fit for modern Austin homes.</p>
    </div>
    <div class="service-card" id="inspections">
      <h2>Roof inspections</h2>
      <p>Free, honest drone inspections that document your roof's condition from every angle and give you a straightforward recommendation.</p>
    </div>
    <div class="service-card" id="certifications">
      <h2>Roof certifications</h2>
      <p>Certifications for real estate transactions and insurance purposes. A useful tool for realtors, buyers, and sellers across Central Texas.</p>
    </div>
    <div class="service-card" id="maintenance">
      <h2>Preventive maintenance</h2>
      <p>Regular maintenance extends your roof's life and catches small problems before they become expensive ones.</p>
    </div>
  </div>
</section>
""" + CTA_BAND,
    current="services",
)

# ---------------- Storm & insurance ----------------
pages["storm-insurance.html"] = page(
    "/storm-insurance",
    "Hail & Storm Damage Roof Repair in Austin | Insurance Claim Help",
    "Hail hit? Hermes Roofing handles everything, including your insurance. 17 years restoring storm-damaged roofs in Austin's Hail Alley. Free inspections within 24-48 hours.",
    """
<section class="page-hero">
  <div class="wrap">
    <h1>Hail hit? We handle everything &mdash; including your insurance.</h1>
    <p>Austin sits in Texas Hail Alley. We've restored storm-damaged roofs here for 17 years, and we sit across from the adjuster so you don't have to.</p>
    <p style="margin-top:18px"><a class="btn btn-solid" href="/contact">Start my storm inspection</a></p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="storm">
      <div class="storm-copy">
        <span class="tag">What to expect</span>
        <h2>Local, honest, and fast</h2>
        <p>After a storm, out-of-town crews flood Central Texas. We're the opposite: family-owned, based in East Austin since 2009, and still here long after the storm season ends. Texas homeowners generally have 2 years to file a storm claim, so even older damage may still be covered.</p>
        <div class="storm-actions">
          <a class="btn btn-cream" href="tel:15125227310">Call (512) 522-7310</a>
          <span class="note">Response within 24&ndash;48 hours</span>
        </div>
      </div>
      <div class="storm-media">
        <img src="/images/roof-inspection-aerial-view-austin-tx.jpg" alt="Aerial roof inspection after hail in Austin, Texas" loading="lazy">
      </div>
    </div>
    <div class="steps">
      <div class="step"><span class="step-num" aria-hidden="true">1</span><div><h3>We inspect</h3><p>Free drone hail assessment with photo documentation of every issue we find.</p></div></div>
      <div class="step"><span class="step-num" aria-hidden="true">2</span><div><h3>We handle the claim</h3><p>We meet your insurance adjuster on site and manage the paperwork end to end.</p></div></div>
      <div class="step"><span class="step-num" aria-hidden="true">3</span><div><h3>We restore</h3><p>Most roofs are completed in one day, guaranteed leak-free, with the yard swept clean.</p></div></div>
    </div>
    <div class="guarantee">
      <span class="work-icon" aria-hidden="true">&#128737;</span>
      <div>
        <h3>The kid-safe yard guarantee</h3>
        <p>We sweep every lawn with a metal detector before we leave. Ninety minutes finding stray nails is normal for us &mdash; your kids play out there.</p>
      </div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <h2 style="margin-bottom:16px">Signs your roof took hail damage</h2>
    <p class="lede">Hail damage isn't always obvious from the ground. Look for dented gutters or downspouts, granules collecting at the bottom of downspouts, bruised or cracked shingles, and damage to soft metals like roof vents and flashing. If a storm has passed through your neighborhood, a free inspection is the safest way to know for sure &mdash; and photo documentation from a professional makes your insurance claim far stronger.</p>
  </div>
</section>
""" + CTA_BAND,
    current="storm",
)

# ---------------- Our crew ----------------
pages["our-crew.html"] = page(
    "/our-crew",
    "Our Crew | Family-Owned Austin Roofers Since 2009 | Hermes Roofing",
    "Meet the family-owned Hermes Roofing crew: Peter, Landon, Jesse, and Corey. 17 years of Austin roofs, A+ BBB accreditation, and a no-pressure approach.",
    """
<section class="page-hero">
  <div class="wrap">
    <h1>A crew your neighbors know by name</h1>
    <p>Hermes Roofing is a family-owned company based in East Austin. We started in 2009, and we've built our reputation one roof at a time: honest recommendations, careful work, and a clean site when we leave.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="crew-grid">
      <div class="crew-card"><div class="crew-avatar" aria-hidden="true">PH</div><h3>Peter</h3><p>Owner &middot; estimates &amp; inspections</p></div>
      <div class="crew-card"><div class="crew-avatar" aria-hidden="true">LH</div><h3>Landon</h3><p>Insurance claims &amp; scheduling</p></div>
      <div class="crew-card"><div class="crew-avatar" aria-hidden="true">JH</div><h3>Jesse</h3><p>Lead installer</p></div>
      <div class="crew-card"><div class="crew-avatar" aria-hidden="true">CH</div><h3>Corey</h3><p>Site &amp; cleanup</p></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <h2 style="margin-bottom:22px">How we work</h2>
    <div class="work-grid">
      <div class="work-card">
        <span class="work-icon" aria-hidden="true">&#8962;</span>
        <h3>We protect your property</h3>
        <p>Landscaping and neighboring property are covered with tarps and plywood sheeting before work begins.</p>
      </div>
      <div class="work-card">
        <span class="work-icon" aria-hidden="true">&#10004;</span>
        <h3>Clean site, every day</h3>
        <p>All debris is removed at the end of each work day into a dumpster we supply.</p>
      </div>
      <div class="work-card">
        <span class="work-icon" aria-hidden="true">&#9878;</span>
        <h3>We stand behind our work</h3>
        <p>Repairs are guaranteed leak-free for 2 years, with warranty visits normally within 48 hours.</p>
      </div>
    </div>
    <div class="guarantee">
      <span class="work-icon" aria-hidden="true">&#128737;</span>
      <div>
        <h3>No-pressure, always</h3>
        <p>Our aim is to help you make the best decision for your home with sustainable, long-term solutions. If a repair is the right call instead of a replacement, that's what we'll tell you.</p>
      </div>
    </div>
  </div>
</section>
""" + CTA_BAND,
    current="crew",
)

# ---------------- Gallery ----------------
GALLERY_ITEMS = [
    ("completed-roof-replacement-drone-austin-tx.jpg", "Completed shingle roof replacement, drone view", "Roof replacement &middot; Austin, TX"),
    ("roof-replacement-stone-home-austin-tx.jpg", "New shingle roof on a two-story stone home", "Roof replacement &middot; Austin, TX"),
    ("architectural-shingle-roof-dormers-central-texas.jpg", "Architectural shingle roof with three dormers", "Shingle roofing &middot; Central Texas"),
    ("new-shingle-roof-two-story-home-central-texas.jpg", "New shingle roof on a gray two-story home", "Roof replacement &middot; Central Texas"),
    ("metal-tile-roof-detail-austin-tx.jpg", "Metal tile roof detail with brick chimney", "Metal roofing &middot; Austin, TX"),
    ("composition-shingle-roof-aerial-central-texas.jpg", "Composition shingle roof, aerial view", "Roof replacement &middot; Central Texas"),
    ("roof-inspection-aerial-view-austin-tx.jpg", "Aerial view of a roof inspection", "Roof inspection &middot; Austin, TX"),
    ("metal-roof-installation-roofer-austin-tx.jpg", "Roofer installing a metal roof panel", "Metal roofing &middot; Austin, TX"),
    ("roofing-crew-installing-roof-deck-central-texas.jpg", "Crew installing roof decking at sunset", "New roof construction &middot; Central Texas"),
    ("roofing-contractors-shingle-installation-austin-tx.png", "Roofers installing shingles over new decking", "Shingle installation &middot; Austin, TX"),
]
figs = "\n".join(
    f'<figure><img src="/images/{f}" alt="{a}" loading="lazy"><figcaption>{c}</figcaption></figure>'
    for f, a, c in GALLERY_ITEMS
)
pages["gallery.html"] = page(
    "/gallery",
    "Our Work | Roof Replacement & Repair Photos | Hermes Roofing Austin",
    "Photos of recent roof replacements, metal roofs, and repairs by Hermes Roofing Company across Austin and Central Texas.",
    f"""
<section class="page-hero">
  <div class="wrap">
    <h1>Recent work across Central Texas</h1>
    <p>A look at recent roofs by our crew. This gallery grows as jobs complete &mdash; check back, or ask us for references from your neighborhood.</p>
  </div>
</section>
<section class="section">
  <div class="wrap gallery-page-grid">
{figs}
  </div>
</section>
""" + CTA_BAND,
    current="gallery",
)

# ---------------- Contact ----------------
pages["contact.html"] = page(
    "/contact",
    "Contact Hermes Roofing | Free Roof Inspections in Austin, TX",
    "Get a free roof inspection from Hermes Roofing Company. Call (512) 522-7310 or send a message. Serving Austin, Georgetown, Round Rock, Driftwood, and Central Texas.",
    """
<section class="page-hero">
  <div class="wrap">
    <h1>Get a free inspection</h1>
    <p>Tell us about your roof and we'll call you back to schedule. The more detail the better &mdash; describe the issue you're having, then what you'd like to achieve.</p>
  </div>
</section>
<section class="section">
  <div class="wrap contact-grid">
    <div>
      <ul class="contact-list">
        <li><strong>Phone</strong><a href="tel:15125227310">(512) 522-7310</a></li>
        <li><strong>Email</strong><a href="mailto:peter@hermesrenovations.com">peter@hermesrenovations.com</a></li>
        <li><strong>Address</strong><a href="https://maps.app.goo.gl/3Mt3FMg3XMXFxuTL6" rel="noopener" target="_blank">701 Tillery St Ste 12, Austin, TX 78702</a></li>
        <li><strong>Hours</strong>Mon&ndash;Sat 7am&ndash;5pm &middot; Closed Sunday</li>
      </ul>
      <div class="guarantee" style="margin-top:22px">
        <span class="work-icon" aria-hidden="true">&#9200;</span>
        <div>
          <h3>Storm damage?</h3>
          <p>We prioritize urgent storm repairs, with inspections and emergency service usually within 24&ndash;48 hours. Call us directly for the fastest response.</p>
        </div>
      </div>
    </div>
    <div>
      <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" autocomplete="name" required>
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" required>
        <label for="phone">Phone</label>
        <input id="phone" name="phone" type="tel" autocomplete="tel">
        <label for="message">How can we help?</label>
        <textarea id="message" name="message" required></textarea>
        <button class="btn btn-solid" type="submit">Send message</button>
        <p class="form-note">Setup note: replace YOUR_FORM_ID with a free Formspree form ID (see README) to receive submissions by email.</p>
      </form>
    </div>
  </div>
</section>
""",
    current="contact",
)

# ---------------- City pages ----------------
CITIES = {
    "austin": ("Austin", "Based in East Austin, we've been repairing and replacing roofs across the city since 2009, from Hyde Park bungalows to new builds in Mueller and beyond."),
    "georgetown": ("Georgetown", "Georgetown sits squarely in Central Texas hail country, and we've helped homeowners here recover from multiple major hail seasons."),
    "round-rock": ("Round Rock", "Round Rock's mix of established neighborhoods and newer developments means roofs of every age, and we service them all."),
    "driftwood": ("Driftwood", "From ranch properties to modern Hill Country homes, Driftwood roofs face intense sun and sudden storms, and we build for both."),
    "marble-falls": ("Marble Falls", "We extend our full residential and commercial services to Marble Falls and the surrounding Highland Lakes communities."),
    "temple": ("Temple", "Temple homeowners get the same crew, the same guarantee, and the same insurance claim support we provide across Central Texas."),
    "killeen": ("Killeen", "We proudly serve Killeen with honest inspections, storm restoration, and full roof replacements."),
}

for slug, (city, blurb) in CITIES.items():
    schema = f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "RoofingContractor",
  "name": "Hermes Roofing Company",
  "url": "{SITE}/service-areas/{slug}",
  "telephone": "+1-512-522-7310",
  "address": {{"@type": "PostalAddress", "streetAddress": "701 Tillery St Ste 12", "addressLocality": "Austin", "addressRegion": "TX", "postalCode": "78702", "addressCountry": "US"}},
  "areaServed": "{city}, TX"
}}
</script>"""
    pages[f"service-areas/{slug}.html"] = page(
        f"/service-areas/{slug}",
        f"Roof Repair & Replacement in {city}, TX | Hermes Roofing Company",
        f"5-star rated roof repair, replacement, and hail damage restoration in {city}, TX. Family-owned since 2009, A+ BBB accredited, free inspections. Call (512) 522-7310.",
        f"""
<section class="page-hero">
  <div class="wrap">
    <h1>Roof repair &amp; replacement in {city}, TX</h1>
    <p>{blurb}</p>
    <p style="margin-top:18px"><a class="btn btn-solid" href="/contact">Get a free inspection in {city}</a></p>
  </div>
</section>
<section class="section">
  <div class="wrap service-grid">
    <div class="service-card">
      <h2>Roofing services in {city}</h2>
      <p>Roof repairs, full replacements, new construction, standing seam metal roofs, inspections, certifications, and preventive maintenance &mdash; all backed by our 2-year leak-free guarantee.</p>
    </div>
    <div class="service-card">
      <h2>Hail &amp; storm restoration</h2>
      <p>{city} sits in Texas Hail Alley. We inspect for free, document everything with photos, and handle your insurance claim from start to finish. <a href="/storm-insurance">Learn how it works</a>.</p>
    </div>
    <div class="service-card">
      <h2>Why {city} homeowners choose us</h2>
      <p>Family-owned since 2009, insured and bonded, A+ BBB accredited, and 5-star rated. A local crew you can reach by phone, not a storm chaser passing through.</p>
    </div>
    <div class="service-card">
      <h2>Free drone inspections</h2>
      <p>An honest drone-documented look at your roof's condition and a clear recommendation, with no pressure either way. <a href="/contact">Schedule yours</a> or call <a href="tel:15125227310">(512) 522-7310</a>.</p>
    </div>
  </div>
</section>
""" + CTA_BAND,
        extra_head=schema,
    )

# ---------------- Write files + sitemap ----------------
import os
for path, content in pages.items():
    os.makedirs(os.path.dirname(path), exist_ok=True) if "/" in path else None
    with open(path, "w") as f:
        f.write(content)
    print("wrote", path)

urls = ["/", "/services", "/storm-insurance", "/our-crew", "/gallery", "/contact"] + [
    f"/service-areas/{slug}" for slug in CITIES
]
sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for u in urls:
    sitemap += f"  <url><loc>{SITE}{u}</loc></url>\n"
sitemap += "</urlset>\n"
with open("sitemap.xml", "w") as f:
    f.write(sitemap)
print("wrote sitemap.xml")
