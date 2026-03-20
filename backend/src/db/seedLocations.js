const db = require("./connection");

const seeds = [
  ["Kampala", "Central"],
  ["Kampala", "Kawempe"],
  ["Kampala", "Makindye"],
  ["Wakiso", "Nansana"],
  ["Wakiso", "Kira"],
  ["Mukono", "Mukono Central"],
  ["Mukono", "Goma"],
  ["Jinja", "Jinja North"],
  ["Jinja", "Jinja South"],
  ["Mbarara", "Kakoba"],
  ["Mbarara", "Nyamitanga"],
  ["Gulu", "Pece"],
  ["Gulu", "Bardege"],
  ["Masaka", "Nyendo"],
  ["Masaka", "Kimaanya"],
  ["Arua", "Arua Hill"],
  ["Arua", "River Oli"],
  ["Fort Portal", "East Division"],
  ["Fort Portal", "West Division"],
  ["Mbale", "Northern Division"],
  ["Mbale", "Industrial Division"]
];

function seedLocations() {
  const count = db.prepare("SELECT COUNT(1) AS total FROM locations").get().total;
  if (count > 0) return;

  const insert = db.prepare("INSERT INTO locations(location, subcounty) VALUES (?, ?)");
  const tx = db.transaction(() => {
    for (const row of seeds) {
      insert.run(row[0], row[1]);
    }
  });

  tx();
}

module.exports = {
  seedLocations
};
