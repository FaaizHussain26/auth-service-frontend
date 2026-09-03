"use client";

interface EmailPreviewProps {
  logoUrl: string | null;
  companyName: string;
  primaryColor: string;
  secondaryColor?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  footerHtml: string;
  contentHtml?: string;
}

export function EmailPreview({
  logoUrl,
  companyName,
  primaryColor,
  secondaryColor,
  buttonLabel,
  buttonUrl,
  footerHtml,
  contentHtml,
}: EmailPreviewProps) {
  const body =
    contentHtml ??
    `<p>This is a live preview of your branded emails. Your logo, brand colors, and footer details will appear
      exactly as shown on every email Syncora sends on your behalf. Adjust the settings to see changes reflected
      instantly.</p>`;

  const showButton = Boolean(buttonLabel && buttonUrl);

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-sm">
      <div className="flex items-center justify-center px-6 py-7" style={{ background: primaryColor }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={companyName} className="h-8 object-contain" />
        ) : (
          <span className="text-lg font-semibold text-white">{companyName || "Your company"}</span>
        )}
      </div>
      <div className="px-6 py-6 text-sm leading-relaxed text-ink-700" dangerouslySetInnerHTML={{ __html: body }} />
      {showButton ? (
        <div className="px-6 pb-6 text-center">
          <span
            className="inline-block rounded-full px-7 py-3 text-sm font-semibold text-white"
            style={{ background: secondaryColor }}
          >
            {buttonLabel}
          </span>
        </div>
      ) : null}
      <div className="px-6 py-4 text-center text-[11px] text-white" style={{ background: primaryColor }}>
        <div dangerouslySetInnerHTML={{ __html: footerHtml || "" }} />
      </div>
    </div>
  );
}
