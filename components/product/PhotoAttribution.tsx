import type { ProductPhotoCredit } from '@/types';

interface PhotoAttributionProps {
  credit?: ProductPhotoCredit;
  compact?: boolean;
}

export default function PhotoAttribution({ credit, compact = false }: PhotoAttributionProps) {
  if (!credit) return null;

  return (
    <p className={`text-xs leading-relaxed text-neutral-500 ${compact ? 'text-[10px]' : ''}`}>
      Style reference:{' '}
      <a href={credit.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        “{credit.title}”
      </a>
      {' · '}
      {credit.photographer}
      {' · '}
      <a href={credit.licenseUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {credit.license}
      </a>
    </p>
  );
}
