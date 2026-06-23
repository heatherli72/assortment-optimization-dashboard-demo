export type DownloadRow = Record<string, string | number>;

const escapeHtml = (value: string | number) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export function downloadExcel(filename: string, rows: DownloadRow[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const html = `<!doctype html><html><body><table><thead><tr>${headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr>${headers.map((header) => `<td>${escapeHtml(row[header] ?? "")}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
