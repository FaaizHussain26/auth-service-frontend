import Image from "next/image";

export function LoadingScreen({
  tagline = "One platform for all your site startup needs.",
}: {
  tagline?: string;
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          background: "linear-gradient(135deg, #3ed6c8, #1a7d76)",
          boxShadow: "0 12px 28px -6px rgba(31, 138, 130, 0.45)",
        }}
      >
        <div
          className="h-8 w-8 animate-spin"
          style={{
            backgroundColor: "#fff",
            WebkitMaskImage: "url(/assets/syncora-icon.png)",
            maskImage: "url(/assets/syncora-icon.png)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            animationDuration: "1.4s",
          }}
        />
      </div>
      <Image src="/assets/syncora-wordmark.png" alt="Syncora" width={178} height={50} unoptimized priority className="h-[34px] w-auto" />
      <p className="text-sm text-ink-500">{tagline}</p>
    </div>
  );
}
