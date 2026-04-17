export interface ColorSelection {
  name: string;
  hex: string;
  quantity: number;
}

export interface OrderItemConfig {
  bundleType?: string | null;
  selectedColor?: string | null;
  selectedSize?: string | null;
  colorSelections?: string | null;
}

export function parseColorSelections(raw: string | null | undefined): ColorSelection[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as ColorSelection[];
  } catch {}
  return null;
}

export function parseSelectedColor(raw: string | null | undefined): { name: string; hex: string } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.name) {
      return { name: String(parsed.name), hex: String(parsed.hex || "") };
    }
  } catch {
    if (typeof raw === "string" && raw.trim()) return { name: raw.trim(), hex: "" };
  }
  return null;
}

export function getItemConfigLines(item: OrderItemConfig): string[] {
  const lines: string[] = [];
  const cs = parseColorSelections(item.colorSelections);
  const sc = parseSelectedColor(item.selectedColor);

  if (item.bundleType) {
    if (cs) {
      const mix = cs.map((c) => `${c.quantity}× ${c.name}`).join(", ");
      lines.push(`${item.bundleType} — Color mix: ${mix}`);
    } else {
      lines.push(item.bundleType);
    }
    return lines;
  }
  if (sc) lines.push(`Color: ${sc.name}`);
  if (item.selectedSize) lines.push(`Size: ${item.selectedSize}`);
  return lines;
}
