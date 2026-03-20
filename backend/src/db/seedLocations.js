const db = require("./connection");
const fs = require("fs");
const path = require("path");

const COUNTY_FILE = path.resolve(__dirname, "../../../county.json");

function normalizePlaceName(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasColumn(table, column) {
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((row) => row.name === column);
}

function loadHierarchyRows() {
  const raw = fs.readFileSync(COUNTY_FILE, "utf8");
  const counties = JSON.parse(raw);
  const dedupe = new Set();
  const rows = [];

  for (const countyItem of counties) {
    const county = normalizePlaceName(countyItem.county_name);
    const constituencies = Array.isArray(countyItem.constituencies) ? countyItem.constituencies : [];

    for (const constituencyItem of constituencies) {
      const constituency = normalizePlaceName(constituencyItem.constituency_name);
      const wards = Array.isArray(constituencyItem.wards) ? constituencyItem.wards : [];

      for (const wardItem of wards) {
        const ward = normalizePlaceName(wardItem);
        if (!county || !constituency || !ward) {
          continue;
        }

        const key = `${county.toLowerCase()}|${constituency.toLowerCase()}|${ward.toLowerCase()}`;
        if (dedupe.has(key)) {
          continue;
        }

        dedupe.add(key);
        rows.push({ county, constituency, ward });
      }
    }
  }

  return rows;
}

function seedLocations() {
  const hasHierarchyColumns =
    hasColumn("locations", "county") && hasColumn("locations", "constituency") && hasColumn("locations", "ward");

  const count = db.prepare("SELECT COUNT(1) AS total FROM locations").get().total;

  if (count > 0 && hasHierarchyColumns) {
    const withHierarchy = db
      .prepare("SELECT COUNT(1) AS total FROM locations WHERE county IS NOT NULL AND constituency IS NOT NULL AND ward IS NOT NULL")
      .get().total;

    if (withHierarchy === count) {
      return;
    }
  }

  const rows = loadHierarchyRows();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM locations").run();

    if (hasHierarchyColumns) {
      const insert = db.prepare(
        "INSERT INTO locations(location, subcounty, county, constituency, ward) VALUES (?, ?, ?, ?, ?)"
      );

      for (const row of rows) {
        insert.run(row.ward, row.constituency, row.county, row.constituency, row.ward);
      }
      return;
    }

    const legacyInsert = db.prepare("INSERT INTO locations(location, subcounty) VALUES (?, ?)");
    for (const row of rows) {
      legacyInsert.run(row.ward, row.constituency);
    }
  });

  tx();
}

module.exports = {
  seedLocations
};
