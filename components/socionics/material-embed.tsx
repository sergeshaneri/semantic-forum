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

function getSpotifyEmbed(url: string): string | null {
  // open.spotify.com/{kind}/{id} → embed/{kind}/{id}
  const m = url.match(
    /open\.spotify\.com\/(?:embed\/)?(track|episode|show|playlist|album)\/([A-Za-z0-9]+)/,
  );
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
}

function getSoundCloudEmbed(url: string): string | null {
  if (!/soundcloud\.com/.test(url)) return null;
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23808080&auto_play=false&hide_related=true&visual=false`;
}

function getYandexMusicEmbed(url: string): string | null {
  // music.yandex.ru/album/{albumId}/track/{trackId}
  const trackMatch = url.match(
    /music\.yandex\.[a-z]+\/album\/(\d+)\/track\/(\d+)/,
  );
  if (trackMatch) {
    return `https://music.yandex.ru/iframe/#track/${trackMatch[2]}/${trackMatch[1]}`;
  }
  const albumMatch = url.match(/music\.yandex\.[a-z]+\/album\/(\d+)$/);
  if (albumMatch) {
    return `https://music.yandex.ru/iframe/#album/${albumMatch[1]}`;
  }
  return null;
}

function isDirectAudioUrl(url: string): boolean {
  return /\.(mp3|wav|ogg|m4a|flac|aac)(\?|$)/i.test(url);
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

  const spotify = getSpotifyEmbed(embedUrl);
  if (spotify) {
    return (
      <div className="w-full rounded-lg overflow-hidden border border-border bg-muted">
        <iframe
          src={spotify}
          title={title}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          className="w-full h-[232px]"
        />
      </div>
    );
  }

  const soundcloud = getSoundCloudEmbed(embedUrl);
  if (soundcloud) {
    return (
      <div className="w-full rounded-lg overflow-hidden border border-border bg-muted">
        <iframe
          src={soundcloud}
          title={title}
          allow="autoplay"
          className="w-full h-[166px]"
        />
      </div>
    );
  }

  const yandex = getYandexMusicEmbed(embedUrl);
  if (yandex) {
    return (
      <div className="w-full rounded-lg overflow-hidden border border-border bg-muted">
        <iframe
          src={yandex}
          title={title}
          className="w-full h-[180px]"
        />
      </div>
    );
  }

  if (isDirectAudioUrl(embedUrl)) {
    return (
      <div className="w-full rounded-lg border border-border bg-muted p-3">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio controls src={embedUrl} className="w-full">
          <a href={embedUrl}>{embedUrl}</a>
        </audio>
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
