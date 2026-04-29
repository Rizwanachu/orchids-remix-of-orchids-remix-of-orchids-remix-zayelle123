const CLOUDINARY_RE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
const EXISTING_TRANSFORM_RE = /^[a-z]_[^/]+(?:,[a-z]_[^/]+)*\//i;

type Opts = {
  width?: number;
  quality?: number | "auto" | "auto:good" | "auto:eco" | "auto:low";
  crop?: "limit" | "fill" | "fit" | "scale" | "thumb";
  dpr?: "auto" | number;
};

export function optimizeCloudinaryUrl(src: string, opts: Opts = {}): string {
  if (!src) return src;
  const match = src.match(CLOUDINARY_RE);
  if (!match) return src;

  const base = match[1];
  let rest = match[2];

  if (EXISTING_TRANSFORM_RE.test(rest)) {
    rest = rest.replace(EXISTING_TRANSFORM_RE, "");
  }

  const parts: string[] = ["f_auto"];

  const q = opts.quality ?? "auto";
  parts.push(typeof q === "number" ? `q_${q}` : `q_${q}`);

  if (opts.width && opts.width > 0) {
    const w = Math.min(Math.max(Math.round(opts.width), 16), 1920);
    parts.push(`w_${w}`);
  }

  parts.push(`c_${opts.crop ?? "limit"}`);

  const dpr = opts.dpr ?? "auto";
  parts.push(typeof dpr === "number" ? `dpr_${dpr}` : `dpr_${dpr}`);

  return `${base}${parts.join(",")}/${rest}`;
}
