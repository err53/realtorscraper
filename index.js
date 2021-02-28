const fs = require("fs").promises;
const realtor = require("realtorca");
const GeoPoint = require("geopoint");

const center = new GeoPoint(43.7228633, -79.6666345);

const min = 900 * 1000;
const max = 2 * 1000 * 1000;

const bounding = center.boundingCoordinates(60, null, true);
let opts = {
  Latitude: center.latitude(),
  LatitudeMin: Math.min(bounding[0].latitude(), bounding[1].latitude()),
  LatitudeMax: Math.max(bounding[0].latitude(), bounding[1].latitude()),
  Longitude: center.longitude(),
  LongitudeMin: Math.min(bounding[0].longitude(), bounding[1].longitude()),
  LongitudeMax: Math.max(bounding[0].longitude(), bounding[1].longitude()),
  PriceMin: min,
  PriceMax: max,
  SortOrder: 6,
  SortOrder: "D",
  BedRange: "1-0",
  RecordsPerPage: 200,
  MaximumResults: 1,
  LandSizeRange: "10-0",
};

async function main() {
  // console.log(realtor.buildUrl(opts));

  let output = [];

  const firstPage = await realtor.post(opts);
  console.log(firstPage.Paging);
  output = firstPage.Results;
  if (firstPage.Paging.TotalPages > 1) {
    for (
      let currentPage = 2;
      currentPage <= firstPage.Paging.TotalPages;
      currentPage++
    ) {
      const tempOpts = {
        ...opts,
        CurrentPage: currentPage,
      };

      const newPage = await realtor.post(tempOpts);
      console.log(firstPage.Paging);
      output = output.concat(newPage.Results);
    }
  }
  await fs.writeFile("./output.json", JSON.stringify(output, null, 2));

  const simplified = output.map((obj) => {
    return {
      Id: obj.Id,
      Property: obj.Property,
      Land: obj.Land,
      Building: obj.Building,
    };
  });
  await fs.writeFile("./simplified.json", JSON.stringify(simplified, null, 2));
}

main();
