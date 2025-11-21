const DEFAULT_PLACEHOLDER_IMAGE = "/images/placeholders/product-1.svg";

const PLACEHOLDER_IMAGE_PATHS: string[] = [
  DEFAULT_PLACEHOLDER_IMAGE,
  "/images/placeholders/product-2.svg",
  "/images/placeholders/product-3.svg",
  "/images/placeholders/product-4.svg",
  "/images/placeholders/product-5.svg",
  "/images/placeholders/product-6.svg",
];

let placeholderPointer = 0;
const placeholderMap = new Map<string, string>();

export function getPlaceholderFor(source: string) {
  if (!source || source.startsWith("/")) {
    return source || DEFAULT_PLACEHOLDER_IMAGE;
  }

  const existing = placeholderMap.get(source);
  if (existing) {
    return existing;
  }

  const assignedIndex =
    PLACEHOLDER_IMAGE_PATHS.length === 0
      ? 0
      : placeholderPointer % PLACEHOLDER_IMAGE_PATHS.length;
  const assigned =
    PLACEHOLDER_IMAGE_PATHS[assignedIndex] || DEFAULT_PLACEHOLDER_IMAGE;
  placeholderPointer += 1;
  placeholderMap.set(source, assigned);
  return assigned;
}

export function buildFeaturedImage(url: string, altText: string) {
  return {
    url: getPlaceholderFor(url),
    altText,
    width: 1600,
    height: 1600,
  };
}

export { DEFAULT_PLACEHOLDER_IMAGE };
