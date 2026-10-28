import { HtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

// A value still written as "[Something]" (or left empty) is a placeholder
// that the shop has not filled in yet.
const isReal = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "" && !String(value).trim().startsWith("[");

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const todo = (text) => `<mark class="todo">${escapeHtml(text)}</mark>`;

// A record's "pa" block holds its Punjabi words. On the Punjabi page they take
// the place of the English ones; anything not translated yet stays in English.
const inLang = (value, lang) => {
  if (Array.isArray(value)) return value.map((item) => inLang(item, lang));
  if (value && typeof value === "object" && value[lang]) return { ...value, ...value[lang] };
  return value;
};

// PREVIEW=artifact builds a single self-contained page for the claude.ai preview.
const preview = process.env.PREVIEW === "artifact";

function localBusinessSchema(business, services, site) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description,
  };
  if (isReal(site.url)) schema.url = site.url;
  if (isReal(business.phone)) schema.telephone = business.phone;
  if (isReal(business.email)) schema.email = business.email;

  const address = { "@type": "PostalAddress", addressCountry: "IN" };
  if (isReal(business.streetAddress)) address.streetAddress = business.streetAddress;
  if (isReal(business.city)) address.addressLocality = business.city;
  if (isReal(business.state)) address.addressRegion = business.state;
  if (isReal(business.pincode)) address.postalCode = business.pincode;
  schema.address = address;

  if (business.schemaHours?.length) schema.openingHours = business.schemaHours;
  if (isReal(business.mapsUrl)) schema.hasMap = business.mapsUrl;
  const sameAs = [business.instagram, business.facebook].filter(isReal);
  if (sameAs.length) schema.sameAs = sameAs;

  schema.makesOffer = services.groups.flatMap((group) =>
    group.items.map((item) => {
      const offer = { "@type": "Offer", itemOffered: { "@type": "Service", name: item.name } };
      if (isReal(item.price)) {
        offer.priceSpecification = { "@type": "PriceSpecification", minPrice: Number(item.price), priceCurrency: "INR" };
      }
      return offer;
    })
  );

  // Keep "</script>" from ever closing the tag early.
  return JSON.stringify(schema, null, 2).replace(/</g, "\\u003c");
}

export default function (eleventyConfig) {
  if (!preview) {
    // Photos dropped into src/photos are resized and converted to small
    // modern formats automatically, so pages stay fast on mobile data.
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
      formats: ["avif", "webp", "jpeg"],
      widths: [400, 800, 1200],
      htmlOptions: {
        imgAttributes: { loading: "lazy", decoding: "async" },
      },
    });
  }

  // Until the custom domain is connected, GitHub Pages serves the site from a
  // sub-folder; PATH_PREFIX (set by the deploy workflow) keeps links working there.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addWatchTarget("src/_includes/");

  eleventyConfig.addGlobalData("env", { preview, year: new Date().getFullYear() });

  eleventyConfig.addFilter("isReal", isReal);
  eleventyConfig.addFilter("inLang", inLang);

  // {% ph business.city, "City" %} prints the value, or a highlighted
  // placeholder when it has not been filled in.
  eleventyConfig.addShortcode("ph", (value, label) => {
    if (isReal(value)) return escapeHtml(value);
    return todo(isReal(label) ? `[${label}]` : value || "[To add]");
  });

  eleventyConfig.addShortcode("price", (amount) =>
    isReal(amount) ? `₹${Number(amount).toLocaleString("en-IN")}` : `₹${todo("___")}`
  );

  eleventyConfig.addShortcode("days", (days) => {
    if (!isReal(days)) return `Ready in ${todo("__")} days`;
    return `Ready in ${escapeHtml(days)} ${String(days) === "1" ? "day" : "days"}`;
  });

  // Link that opens a WhatsApp chat with the shop and a message already typed.
  eleventyConfig.addShortcode("waUrl", (number, text) => {
    const digits = isReal(number) ? String(number).replace(/\D/g, "") : "";
    return escapeHtml(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`);
  });

  eleventyConfig.addShortcode("telUrl", (number) =>
    isReal(number) ? `tel:${String(number).replace(/[^\d+]/g, "")}` : "#visit"
  );

  eleventyConfig.addShortcode("localBusinessSchema", localBusinessSchema);

  return {
    dir: { input: "src", output: preview ? "_preview" : "_site" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
