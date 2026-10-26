// The shop page stays unpublished until shop.json says "enabled": true.
export default {
  eleventyComputed: {
    permalink: (data) => (data.shop.enabled && !data.env.preview ? "/shop/" : false),
    eleventyExcludeFromCollections: (data) => !data.shop.enabled,
  },
};
