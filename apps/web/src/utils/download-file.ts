import type { DownloadResponse } from '@web/constant/interface';

/** Downloads an authenticated binary response and releases its object URL. */
export async function downloadFile(
  response: DownloadResponse,
  filename: string,
  errorMessage = 'Unduhan gagal',
) {
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  const url = URL.createObjectURL(await response.blob());
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
