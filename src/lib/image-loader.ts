type LoaderArgs = { src: string; width: number; quality?: number };

const CLOUDINARY_RE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
const EXISTING_TRANSFORM_RE = /^[a-z]_[^/]+(?:,[a-z]_[^/]+)*\//i;

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (!src) return src;

  const match = src.match(CLOUDINARY_RE);
  if (match) {
    const base = match[1];
    let rest = match[2];

    if (EXISTING_TRANSFORM_RE.test(rest)) {
      rest = rest.replace(EXISTING_TRANSFORM_RE, "");
    }

    const w = Math.min(Math.max(Math.round(width), 16), 1920);
    const q = quality ? `q_${Math.min(Math.max(quality, 1), 100)}` : "q_auto";
    const transforms = `f_auto,${q},w_${w},c_limit,dpr_auto`;
    return `${base}${transforms}/${rest}`;
  }

  return src;
}
