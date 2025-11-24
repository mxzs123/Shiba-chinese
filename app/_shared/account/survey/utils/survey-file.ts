export async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

export function matchesAcceptedType(file: File, accept?: string[]) {
  if (!accept || accept.length === 0) {
    return true;
  }

  return accept.some((type) => {
    if (type.endsWith("/*")) {
      const prefix = type.slice(0, type.length - 1);
      return file.type.startsWith(prefix);
    }

    return file.type === type;
  });
}
