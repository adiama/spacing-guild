import * as jsonData from "../mock_data/data.json";
import * as SpacingGuild from "../_bundles/spacing-guild.min.js";

const data = jsonData.default;

/**
 * Named after Spacing Guild Navigator Edric from Frank Herbert's "Dune".
 * https://dune.fandom.com/wiki/Edric
 * https://en.wikipedia.org/wiki/Dune_(novel)
 */
const edric = new SpacingGuild.Navigator(data.locations, data.ship);
// console.log(edric);

const trade = edric.navigate({ fuelMargin: 10 });
console.log(trade);
