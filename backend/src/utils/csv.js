function toCsvValue(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `\"${str.replace(/\"/g, '\"\"')}\"`;
  }
  return str;
}

function rowsToCsv(headers, rows) {
  const headerLine = headers.map((h) => toCsvValue(h.label)).join(",");
  const lines = rows.map((row) =>
    headers.map((h) => toCsvValue(row[h.key])).join(",")
  );
  return [headerLine, ...lines].join("\n");
}

module.exports = {
  rowsToCsv
};
