// @ts-nocheck
export const metadata = { title: "Shops â€“ KeyHero", description: "Verglichene HÃ¤ndler" };

const SHOPS = [
  { name: "CDKeys", note: "Trusted Seller" },
  { name: "Eneba", note: "Key Marketplace" },
  { name: "Instant Gaming", note: "PC Keys" },
  { name: "G2A", note: "Global Keys" },
];

export default function ShopsPage() {
  return (
    <div className="container-xl px-4 py-10">
      <h1 className="font-hero text-[1.4rem] text-textBright mb-2">Shops</h1>
      <p className="text-[13px] text-textDim/75 mb-6">Wir vergleichen seriÃ¶se Anbieter fÃ¼r digitale Keys.</p>
      <div className="grid gap-4 md:grid-cols-4">
        {SHOPS.map((s) => (
          <div key={s.name} className="neon-border-soft p-4 text-center text-[12px]">
            <div className="text-textBright font-hero text-[13px]">{s.name}</div>
            <div className="text-[10px] text-textDim/70 mt-1">{s.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
