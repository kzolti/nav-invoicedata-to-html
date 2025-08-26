const Handlebars = require("handlebars");

// Helper függvények
const helpers = {
  let: (value, options) => {
    // Több változó kezelése a options.hash-ből
    const data = Handlebars.createFrame(options.data);
    
    // Az összes hash paraméter másolása a data-ba
    Object.keys(options.hash).forEach(key => {
      data[key] = options.hash[key];
    });
    
    // A block paraméterek összegyűjtése
    // A value az első paraméter (isSimplified)
    // A többi paraméter a hash-ből jön
    const blockParams = options.blockParams ? [value] : [];
    
    // Ha vannak block paraméterek, akkor a hash-ből másoljuk át őket a blockParams tömbbe
    if (options.blockParams && options.blockParams.length > 1) {
      // A blockParams tömb második eleme után következő paraméterek nevei
      const additionalParams = options.blockParams.slice(1);
      additionalParams.forEach(paramName => {
        if (options.hash[paramName]) {
          blockParams.push(options.hash[paramName]);
        }
      });
    }
    
    return options.fn(value, { data, blockParams });
  },
  concat: (...args) => {
    const values = args.slice(0, -1); // az utolsó a Handlebars options objektum
    return values.join("");
  },
  join: (array, separator) => {
    if (!array || !Array.isArray(array)) return "";
    return array.join(separator);
  },
  multiply: (a, b) => Number(a) * Number(b),
  eq: (a, b) => a === b,
  formatAddress: (address) => {
    if (!address) return "";

    if (address.detailedAddress) {
      const d = address.detailedAddress;
      let ret = `${d.countryCode}, ${d.postalCode} ${d.city}`;
      if (d.streetName) ret += ` ${d.streetName} ${d.publicPlaceCategory}`;
      if (d.number) ret += ` ${d.number || ""}`;
      if (d.building) ret += `, ${t("building")} ${d.building}`;
      if (d.staircase) ret += `, ${t("staircase")} ${d.staircase}`;
      if (d.floor) ret += `, ${t("floor")} ${d.floor}`;
      if (d.door) ret += `, ${t("door")} ${d.door}`;
      if (d.lotNumber) ret += `, ${t("lotNumber")} ${d.lotNumber}`;
      return ret;
    } else if (address.simpleAddress) {
      const s = address.simpleAddress;
      return `${s.postalCode} ${s.city}, ${s.additionalAddressDetail}`;
    }
    return "";
  },
};

module.exports = helpers;
