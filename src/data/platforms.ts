export interface PlatformInfo {
  id: string;
  name: string;
  category: 'social' | 'developer' | 'productivity' | 'entertainment' | 'finance' | 'cloud' | 'gaming' | 'shopping' | 'other';
  defaultUrl: string;
  domain: string;
  popular?: boolean;
  color?: string;
  iconName?: string;
}

export const PLATFORM_CATALOG: PlatformInfo[] = [
  // Developer & Cloud
  { id: 'github', name: 'GitHub', category: 'developer', defaultUrl: 'https://github.com/login', domain: 'github.com', popular: true, color: '#24292e' },
  { id: 'gitlab', name: 'GitLab', category: 'developer', defaultUrl: 'https://gitlab.com/users/sign_in', domain: 'gitlab.com', popular: true, color: '#fc6d26' },
  { id: 'cloudflare', name: 'Cloudflare', category: 'cloud', defaultUrl: 'https://dash.cloudflare.com/login', domain: 'cloudflare.com', popular: true, color: '#f38020' },
  { id: 'openai', name: 'OpenAI / ChatGPT', category: 'productivity', defaultUrl: 'https://chatgpt.com', domain: 'chatgpt.com', popular: true, color: '#10a37f' },
  { id: 'atlassian', name: 'Atlassian / Jira', category: 'productivity', defaultUrl: 'https://id.atlassian.com/login', domain: 'atlassian.com', popular: false, color: '#0052cc' },
  { id: 'figma', name: 'Figma', category: 'productivity', defaultUrl: 'https://www.figma.com/login', domain: 'figma.com', popular: true, color: '#f24e1e' },
  { id: 'notion', name: 'Notion', category: 'productivity', defaultUrl: 'https://www.notion.so/login', domain: 'notion.so', popular: true, color: '#000000' },

  // Tech Giants
  { id: 'google', name: 'Google', category: 'productivity', defaultUrl: 'https://accounts.google.com', domain: 'google.com', popular: true, color: '#4285f4' },
  { id: 'microsoft', name: 'Microsoft / Outlook', category: 'productivity', defaultUrl: 'https://login.live.com', domain: 'microsoft.com', popular: true, color: '#00a4ef' },
  { id: 'apple', name: 'Apple ID', category: 'productivity', defaultUrl: 'https://appleid.apple.com', domain: 'apple.com', popular: true, color: '#555555' },

  // Social & Communication
  { id: 'x', name: 'X (formerly Twitter)', category: 'social', defaultUrl: 'https://x.com/i/flow/login', domain: 'x.com', popular: true, color: '#000000' },
  { id: 'discord', name: 'Discord', category: 'social', defaultUrl: 'https://discord.com/login', domain: 'discord.com', popular: true, color: '#5865f2' },
  { id: 'telegram', name: 'Telegram', category: 'social', defaultUrl: 'https://web.telegram.org', domain: 'telegram.org', popular: true, color: '#229ed9' },
  { id: 'whatsapp', name: 'WhatsApp', category: 'social', defaultUrl: 'https://web.whatsapp.com', domain: 'whatsapp.com', popular: true, color: '#25d366' },
  { id: 'reddit', name: 'Reddit', category: 'social', defaultUrl: 'https://www.reddit.com/login', domain: 'reddit.com', popular: true, color: '#ff4500' },
  { id: 'linkedin', name: 'LinkedIn', category: 'social', defaultUrl: 'https://www.linkedin.com/login', domain: 'linkedin.com', popular: true, color: '#0077b5' },
  { id: 'instagram', name: 'Instagram', category: 'social', defaultUrl: 'https://www.instagram.com/accounts/login/', domain: 'instagram.com', popular: true, color: '#e1306c' },
  { id: 'facebook', name: 'Facebook', category: 'social', defaultUrl: 'https://www.facebook.com/login', domain: 'facebook.com', popular: true, color: '#1877f2' },
  { id: 'tiktok', name: 'TikTok', category: 'social', defaultUrl: 'https://www.tiktok.com/login', domain: 'tiktok.com', popular: true, color: '#000000' },
  { id: 'pinterest', name: 'Pinterest', category: 'social', defaultUrl: 'https://www.pinterest.com/login', domain: 'pinterest.com', popular: false, color: '#e60023' },
  { id: 'slack', name: 'Slack', category: 'productivity', defaultUrl: 'https://slack.com/signin', domain: 'slack.com', popular: true, color: '#4a154b' },
  { id: 'zoom', name: 'Zoom', category: 'productivity', defaultUrl: 'https://zoom.us/signin', domain: 'zoom.us', popular: false, color: '#2d8cff' },

  // Entertainment & Streaming
  { id: 'youtube', name: 'YouTube', category: 'entertainment', defaultUrl: 'https://www.youtube.com', domain: 'youtube.com', popular: true, color: '#ff0000' },
  { id: 'spotify', name: 'Spotify', category: 'entertainment', defaultUrl: 'https://accounts.spotify.com/login', domain: 'spotify.com', popular: true, color: '#1db954' },
  { id: 'netflix', name: 'Netflix', category: 'entertainment', defaultUrl: 'https://www.netflix.com/login', domain: 'netflix.com', popular: true, color: '#e50914' },
  { id: 'twitch', name: 'Twitch', category: 'entertainment', defaultUrl: 'https://www.twitch.tv/login', domain: 'twitch.tv', popular: true, color: '#9146ff' },

  // Gaming
  { id: 'steam', name: 'Steam', category: 'gaming', defaultUrl: 'https://store.steampowered.com/login', domain: 'steampowered.com', popular: true, color: '#171a21' },
  { id: 'epicgames', name: 'Epic Games', category: 'gaming', defaultUrl: 'https://www.epicgames.com/id/login', domain: 'epicgames.com', popular: true, color: '#313131' },
  { id: 'playstation', name: 'PlayStation Network', category: 'gaming', defaultUrl: 'https://my.playstation.com', domain: 'playstation.com', popular: false, color: '#003791' },
  { id: 'xbox', name: 'Xbox / Live', category: 'gaming', defaultUrl: 'https://www.xbox.com', domain: 'xbox.com', popular: false, color: '#107c10' },

  // Finance & Shopping
  { id: 'paypal', name: 'PayPal', category: 'finance', defaultUrl: 'https://www.paypal.com/signin', domain: 'paypal.com', popular: true, color: '#003087' },
  { id: 'stripe', name: 'Stripe', category: 'finance', defaultUrl: 'https://dashboard.stripe.com/login', domain: 'stripe.com', popular: false, color: '#635bff' },
  { id: 'amazon', name: 'Amazon', category: 'shopping', defaultUrl: 'https://www.amazon.com/ap/signin', domain: 'amazon.com', popular: true, color: '#ff9900' },
  { id: 'ebay', name: 'eBay', category: 'shopping', defaultUrl: 'https://signin.ebay.com', domain: 'ebay.com', popular: false, color: '#e53238' },
  { id: 'shopify', name: 'Shopify', category: 'shopping', defaultUrl: 'https://accounts.shopify.com', domain: 'shopify.com', popular: false, color: '#96bf48' },

  // Privacy & Cloud
  { id: 'proton', name: 'Proton (Mail / VPN / Drive)', category: 'productivity', defaultUrl: 'https://account.proton.me/login', domain: 'proton.me', popular: true, color: '#6d4aff' },
  { id: 'bitwarden', name: 'Bitwarden', category: 'productivity', defaultUrl: 'https://vault.bitwarden.com', domain: 'bitwarden.com', popular: false, color: '#175ddc' },
  { id: 'dropbox', name: 'Dropbox', category: 'cloud', defaultUrl: 'https://www.dropbox.com/login', domain: 'dropbox.com', popular: false, color: '#0061ff' },
  { id: 'uber', name: 'Uber', category: 'other', defaultUrl: 'https://auth.uber.com/login', domain: 'uber.com', popular: false, color: '#000000' },
  { id: 'airbnb', name: 'Airbnb', category: 'other', defaultUrl: 'https://www.airbnb.com/login', domain: 'airbnb.com', popular: false, color: '#ff5a5f' },
  { id: 'adobe', name: 'Adobe Creative Cloud', category: 'productivity', defaultUrl: 'https://account.adobe.com', domain: 'adobe.com', popular: false, color: '#ff0000' },
];

/**
 * Searches the offline platform catalog with case-insensitive and fuzzy partial matching.
 */
export function searchPlatforms(query: string): PlatformInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return PLATFORM_CATALOG.filter((p) => p.popular);
  }

  return PLATFORM_CATALOG.filter((p) => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    // Exact startsWith gets higher priority
    const aStarts = a.name.toLowerCase().startsWith(q);
    const bStarts = b.name.toLowerCase().startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
  });
}
