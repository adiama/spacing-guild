import * as jsonData from "../mock_data/data.json";
import { Navigator as GuildNavigator } from "../dist/index.js";

const data = jsonData.default;

/**
 * Named after Spacing Guild Navigator Edric from Frank Herbert's "Dune".
 * https://dune.fandom.com/wiki/Edric
 * https://en.wikipedia.org/wiki/Dune_(novel)
 */
const edric = new GuildNavigator(data.locations, data.ship);

const trade = edric.navigate({ fuelMargin: 10 });
console.log(trade);
