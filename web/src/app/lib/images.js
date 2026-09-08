// Sumber gambar produk — SEMUA lokal di /public/products (scrape geraikita CDN + Wikimedia, diresize).
// simple-icons banyak yang 404 utk brand Indonesia — makanya gambar produk sebelumnya tidak tampil.

const localImages = {
  "mobile-legends": "/products/mobile-legends.png",
  "free-fire": "/products/free-fire.png",
  "genshin-impact": "/products/genshin-impact.png",
  "pubg-mobile": "/products/pubg-mobile.png",
  "valorant": "/products/valorant.png",
  "pulsa-telkomsel": "/products/pulsa-telkomsel.png",
  "pulsa-xl": "/products/pulsa-xl.png",
  "pulsa-axis": "/products/pulsa-axis.png",
  "data-telkomsel": "/products/pulsa-telkomsel.png",
  "token-pln": "/products/token-pln.png",
  "spotify-premium": "/products/spotify-premium.png",
  "netflix-premium": "/products/netflix-premium.png",
  "chatgpt-plus": "/products/chatgpt-plus.png",
  "youtube-premium": "/products/youtube-premium.png",
  "canva-pro": "/products/canva-pro.png",
  "capcut-pro": "/products/capcut-pro.png",
  "disney-hotstar": "/products/disney-hotstar.png",
  "vidio-platinum": "/products/vidio-platinum.png",
  "ai-api-deepseek": "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/deepseek-color.svg",
  "ai-api-qwen": "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/qwen-color.svg",
};

export function productImage(slug) {
  return localImages[slug] || null;
}

export const aiLogos = {
  Claude: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/claude-color.svg",
  GPT: "/products/chatgpt-plus.png",
  DeepSeek: localImages["ai-api-deepseek"],
  Qwen: localImages["ai-api-qwen"],
  GLM: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/chatglm-color.svg",
};
