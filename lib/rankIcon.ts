export function rankIcon(tier: string): string {
  const normalizedTier = tier.toLowerCase();

  const icons: Record<string, string> = {
    diamond: "/ranks/diamond.png",
    master: "/ranks/master.png",
    grandmaster: "/ranks/grandmaster.png",
    challenger: "/ranks/challenger.png",
  };

  return icons[normalizedTier] || "";
}