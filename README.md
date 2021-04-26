# Spacing Guild

![GitHub package.json version](https://img.shields.io/github/package-json/v/adiama/spacing-guild)

A library of useful features for [SpaceTraders API](https://spacetraders.io/)

---

## Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Using Navigator](#using-navigator)
  - [Using Mentat](#using-mentat)
- [Build](#build)
- [Documentation](#documentation)
  - [Navigator](#navigator)
  - [Mentat](#mentat)
  <!-- - [Licence](#licence) -->

---

## Installation

`npm i spacing-guild --save`

---

## Usage

### Using Navigator

```typescript
import { Navigator, ITradeRoute } from "spacing-guild";

// ...

const edric: Navigator = new Navigator(locations, ship);
const route: ITradeRoute = edric.navigate();
```

Example result

```json
{
  "destination": "OE-PM",
  "cargo": [
    { "good": "FUEL", "quantity": 3, "totalVolume": 3 },
    { "good": "METALS", "quantity": 10, "totalVolume": 10 },
    { "good": "DRONES", "quantity": 2, "totalVolume": 4 },
    { "good": "FUEL", "quantity": 33, "totalVolume": 33 }
  ]
}
```

### Using Mentat

```typescript
import { Mentat } from "spacing-guild";

// ...

const distance: number = Mentat.calculateLocationDistance(locationA, locationB);
const inRange: number = Mentat.validateRange(ship, range, location);
```

---

## Build

`npm i`

`npm run build`

---

## Documentation

### Navigator

The Navigator class is will decide the **most profitable, possible trade from the ship's current location**

It will return an object with 2 properties: `Destination` and `Cargo`

- `Destination` is a location type object that can be used when setting the flight plan.
- `Cargo` contains all the goods that should be bought from current marketplace and in what quantities, as well as the FUEL required for the trip. These goods should then be sold at the destination's marketplace.

Navigator class takes 2 arguments

- `locations` : A list of location objects to parse through
- `ship` : The ship object

Once a Navigator object is created, it automatically parses the `locations` and sets a list of all available trades. This list will then be used in the `navigate()` method to narrow down the possible trades based on the method's arguments.

_note: In the following table, the column **Type** will contain some custom interfaces. Please refer to the [Interfaces](https://github.com/adiama/spacing-guild/blob/main/src/interfaces/index.ts) typescript file for information_

| Methods             | Arguments           | Type                                | Description                                                                                                                               |
| ------------------- | ------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| updateLocationsData |                     | void                                |                                                                                                                                           |
|                     | locations           | ILocations[]                        | The list of locations                                                                                                                     |
| updateShipData      |                     | void                                |                                                                                                                                           |
|                     | ship                | IShip                               | The ship object                                                                                                                           |
| navigate            |                     | _returns_ ITradeRoute               |                                                                                                                                           |
|                     | params (_optional_) | {range: number, fuelMargin: number} |                                                                                                                                           |
|                     |                     |                                     | `range` is a number to limit the search for trade routes                                                                                  |
|                     |                     |                                     | `fuelMargin` is a number representing a percentage (_ex. 5 is 5%_) to include as error margin when calculating the FUEL needed for a trip |
|                     | strict (_optional_) | boolean (default `false`)           | Default is `false`. If `true` it throws errors instead of returning void in cases where trades are impossible                             |

NOTES

- If one of the profitable trades happens to be FUEL, it adds an extra entry with FUEL.
- This should not be sold as it can be used for further traveling and save costs because it was bought in a better price.
- If there is space left and no more available trades on destination, the remaining space will be empty.
- Currently this only works within the ship's system. Intersystem route plotting is the future. #TODO

### Mentat

The Mentat class is solely responsible for various calculations. All methods are public static and return either a number or a boolean.

_note: In the following table, the column **Type** will contain some custom interfaces. Please refer to the [Interfaces](https://github.com/adiama/spacing-guild/blob/main/src/interfaces/index.ts) typescript file for information_

| Methods                            | Arguments     | Type              | Description                                                                                                                                                                                                                            |
| ---------------------------------- | ------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| calculateFuelToTravel              |               | _returns_ number  | Calculates the amount of fuel required to travel from _location_ to _destination_                                                                                                                                                      |
|                                    | ship          | IShip             |                                                                                                                                                                                                                                        |
|                                    | location      | ILocation         |                                                                                                                                                                                                                                        |
|                                    | destination   | ILocation         |                                                                                                                                                                                                                                        |
| calculateFuelQuantity              |               | _returns_ number  | Calculates the remaining fuel needed to reach the quantity required for travel. Considers existing fuel in the ship. Adds extra fuel depending on the margin.                                                                          |
|                                    | ship          | IShip             |                                                                                                                                                                                                                                        |
|                                    | fuelToTravel  | number            |                                                                                                                                                                                                                                        |
|                                    | margin        | number (optional) |                                                                                                                                                                                                                                        |
| calculateDistance                  |               | _returns_ number  | Calculates the distance between 2 points                                                                                                                                                                                               |
|                                    | ax            | number            |                                                                                                                                                                                                                                        |
|                                    | ay            | number            |                                                                                                                                                                                                                                        |
|                                    | bx            | number            |                                                                                                                                                                                                                                        |
|                                    | by            | number            |                                                                                                                                                                                                                                        |
| calculateLocationDistance          |               | _returns_ number  | Calculates the distance between 2 locations                                                                                                                                                                                            |
|                                    | a             | ILocation         |                                                                                                                                                                                                                                        |
|                                    | b             | ILocation         |                                                                                                                                                                                                                                        |
| calculatePricePerVolume            |               | _returns_ number  | Calculates the price per volume of a good. (_Ex.If a unit of MACHINERY is 2 volumes and is priced at 10, then the price per volume is 5_)                                                                                              |
|                                    | pricePerUnit  | number            |                                                                                                                                                                                                                                        |
|                                    | volumePerUnit | number            |                                                                                                                                                                                                                                        |
| calculateGoodProfitPerVol          |               | _returns_ number  | Calculates the profit per volume of a good bought in local marketplace and sold on another marketplace                                                                                                                                 |
|                                    | a             | IGood             |                                                                                                                                                                                                                                        |
|                                    | b             | IGood             |                                                                                                                                                                                                                                        |
| calculateGoodProfit                |               | _returns_ number  | Calculates the gross gain of selling a good                                                                                                                                                                                            |
|                                    | good          | IGood             |                                                                                                                                                                                                                                        |
|                                    | amount        | number            |                                                                                                                                                                                                                                        |
| calculateGoodCost                  |               | _returns_ number  | Calculates the cost of buying a good                                                                                                                                                                                                   |
|                                    | good          | IGood             |                                                                                                                                                                                                                                        |
|                                    | amount        | number            |                                                                                                                                                                                                                                        |
| calculateFuelToTravelCost          |               | _returns_ number  | Calculates the cost of fuel                                                                                                                                                                                                            |
|                                    | amount        | number            |                                                                                                                                                                                                                                        |
|                                    | unitCost      | number            |                                                                                                                                                                                                                                        |
| calculateCargoVolume               |               | _returns_ number  | Calculates the total volume of a good                                                                                                                                                                                                  |
|                                    | good          | IGood             |                                                                                                                                                                                                                                        |
|                                    | ship          | IShip             |                                                                                                                                                                                                                                        |
| calculateGoodQuantity              |               | _returns_ number  | Calculates the quantity of a good based on the available cargo space                                                                                                                                                                   |
|                                    | space         | number            |                                                                                                                                                                                                                                        |
|                                    | volumePerUnit | number            |                                                                                                                                                                                                                                        |
| calculateProfitPerDU               |               | _returns_ number  | Calculates the profit per Distance Unit based on fuel cost, goods profit and distance to marketplace from the ship's position. The Profit per DU metric is used to sort the trades. The highest PpDU route is the best trade available |
|                                    | aGood         | IGood             |                                                                                                                                                                                                                                        |
|                                    | bGood         | IGood             |                                                                                                                                                                                                                                        |
|                                    | ship          | IShip             |                                                                                                                                                                                                                                        |
|                                    | location      | ILocation         |                                                                                                                                                                                                                                        |
|                                    | destination   | ILocation         |                                                                                                                                                                                                                                        |
|                                    | fuelUnitCost  | number            |                                                                                                                                                                                                                                        |
| calculateFuelToTravelVolume        |               | _returns_ number  | Calculates the volume of FUEL                                                                                                                                                                                                          |
|                                    | amount        | number            |                                                                                                                                                                                                                                        |
| calculateGoodVolume                |               | _returns_ number  | Calculates the volume of a good's quantity                                                                                                                                                                                             |
|                                    | amount        | number            |                                                                                                                                                                                                                                        |
|                                    | good          | IGood             |                                                                                                                                                                                                                                        |
| calculateRemainingSpaceAfterRefuel |               | _returns_ number  | Calculates the available cargo space after buying the fuel necessary for the route                                                                                                                                                     |
|                                    | ship          | IShip             |                                                                                                                                                                                                                                        |
|                                    | fuelQuantity  | number            |                                                                                                                                                                                                                                        |
| validateRange                      |               | _returns_ boolean | Validates if a location is within the given range of the ship                                                                                                                                                                          |
|                                    | ship          | IShip             |                                                                                                                                                                                                                                        |
|                                    | range         | number            |                                                                                                                                                                                                                                        |
|                                    | location      | ILocation         |                                                                                                                                                                                                                                        |

---

<!-- ## Licence

--- -->
