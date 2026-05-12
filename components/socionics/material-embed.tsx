type Props = {
  embedUrl: string;
  title: string;
};

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return m?.[1] ?? null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d{6,})/);
  return m?.[1] ?? null;
}

export function MaterialEmbed({ embedUrl, title }: Props) {
  const ytId = getYouTubeId(embedUrl);
  if (ytId) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden border border-border bg-muted">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  const vmId = getVimeoId(embedUrl);
  if (vmId) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden border border-border bg-muted">
        <iframe
          src={`https://player.vimeo.com/video/${vmId}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Generic external content — sandboxed for safety
  return (
    <div className="space-y-2">
      <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border border-border bg-muted">
        <iframe
          src={embedUrl}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          referrerPolicy="no-referrer"
          className="w-full h-full"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Источник:{" "}
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {embedUrl}
        </a>
      </p>
    </div>
  );
}
