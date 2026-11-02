export const platforms = [
  { id: "website", label: "Website", price: 500000 },
  { id: "webapp", label: "Web Application", price: 1500000 },
  { id: "android", label: "Android", price: 2500000 },
  { id: "ios", label: "iOS", price: 2800000 },
  { id: "desktop", label: "Desktop", price: 2000000 },
  { id: "cross", label: "Cross Platform", price: 4000000 },
];

export const complexities = [
  { id: "basic", label: "Basic", multiplier: 1 },
  { id: "medium", label: "Medium", multiplier: 1.6 },
  { id: "advanced", label: "Advanced", multiplier: 2.5 },
  { id: "enterprise", label: "Enterprise", multiplier: 4 },
];

export const features = [
  { id: "auth", label: "Authentication", price: 300000 },
  { id: "roles", label: "Multi Role", price: 500000 },
  { id: "dashboard", label: "Dashboard", price: 700000 },
  { id: "database", label: "Database", price: 400000 },
  { id: "api", label: "REST API", price: 600000 },
  { id: "payment", label: "Payment Gateway", price: 800000 },
  { id: "notification", label: "Notification", price: 400000 },
  { id: "chat", label: "Chat", price: 1000000 },
  { id: "report", label: "Report", price: 500000 },
  { id: "ai", label: "AI", price: 2000000 },
  { id: "admin", label: "Admin Panel", price: 800000 },
];

export function calculateEstimate({ platformId, complexityId, featureIds }) {
  const platform = platforms.find((p) => p.id === platformId);
  const complexity = complexities.find((c) => c.id === complexityId);
  const featureTotal = features.filter((f) => featureIds.includes(f.id)).reduce((sum, f) => sum + f.price, 0);
  const total = (platform.price + featureTotal) * complexity.multiplier;
  const round = (n) => Math.round(n / 50000) * 50000;
  return { min: round(total * 0.85), max: round(total * 1.25) };
}
