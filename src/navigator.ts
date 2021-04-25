import { ILocation, ICargo, IShip, ITradeRoute, ITrade, IGood, ITradeOption, INavigationParameters } from './interfaces/index.js';
import { Mentat } from './mentat.js';

/**
 * This class handles the logic for the best possible trades from ship's location.
 * 
 * Requires a list of locations and the ship data.
 * The locations list will be parsed and each marketplace will be used in the calculations
 * 
 * The more locations (with marketplace data) it is given the more likely it will return
 * profitable trades.
 *  
 * 
 * USAGE
 *  - const edric: Navigator = new Navigator(locations, ship);
 *  - const route: ITradeRoute = edric.navigate(); // see navigate method for arguments
 * 
 * IMPORTANT
 *  - The navigator handles only the logic for the best possible trades from ship's location.
 *  - This class should not contain any calculations at all. Not even a simple addition.
 *      ALL calculations should be handled by the Mentat.
 * 
 * NOTES
 *  - Ideally, this should be used once all marketplaces of a system are available and up to date.
 *  - Cached market data that is out of date could result in unprofitable trades as markets are very volatile.
 * 
 * TODO
 *  - Finish descriptions
 * 
 * Named after Spacing Guild Navigators from Frank Herbert's "Dune".
 * https://dune.fandom.com/wiki/Guild_Navigator
 * https://en.wikipedia.org/wiki/Dune_(novel)
 */
export class Navigator {
    private _initialized: boolean = false;
    private _locations: ILocation[];
    private _ship: IShip;
    private _currentLocation: ILocation;
    private _currentMarketplace: IGood[];
    private _currentFuelUnitCost: number;
    private _tradeOptions: ITradeOption[];

    get currentLocation(): ILocation {
        return this._currentLocation;
    }

    get currentMarketplace(): IGood[] {
        return this._currentMarketplace;
    }

    get currentFuelUnitCost(): number {
        return this._currentFuelUnitCost;
    }

    get tradeOptions(): ITradeOption[] {
        return this._tradeOptions;
    }

    /**
     * 
     * @param locations ILocation[]
     * @param ship ILocation
     */
    constructor(locations: ILocation[], ship: IShip) {
        this.updateLocationsData(locations);
        this.updateShipData(ship);
        this.sortTradeOptions();
        this._initialized = true;
    }

    /**
     * 
     * @param locations ILocation[]
     */
    public updateLocationsData(locations: ILocation[]): void {
        this._locations = locations;
        if (this._initialized) {
            this.setProperties();
            this.sortTradeOptions();
        }
    }

    /**
     * 
     * @param ship IShip
     */
    public updateShipData(ship: IShip): void {
        this._ship = ship;
        this.setProperties();

        if (this._initialized) {
            this.sortTradeOptions();
        }
    }

    /**
     * Plots the most profitable trade route
     * 
     * - Starts with the list of all possible trades from the current location
     *      to the provided destinations.
     * 
     * - Then, if range is provided, filters those destinations
     *      to only those in range.
     * 
     * - Verifies any profitable trades and sets the best trade's location as the
     *      route's destination IF fueling for trip is possible.
     * 
     * - Sets the required FUEL in the response to be bought. The final amount of FUEL
     *      is calculated based on current excess of FUEL in cargo so it will not buy more
     *      than required for the trip. Unless the fuelMargin is set, in which case it will
     *      include that margin.
     * 
     * - With the destination set, it starts filling cargo with goods, ordered by profit.
     * 
     * Theoretically, at destination, after selling the cargo in the result object,
     * the ship's cargo should be completely empty as all the fuel will be spent and all goods will be sold.
     * 
     * If one of the profitable trades happens to be FUEL, it adds an extra entry with FUEL.
     * This should not be sold as it can be used for further traveling and save costs
     * because it was bought in a better price.
     * 
     * NOTES
     *  - If there is space left and no more available trades on destination,
     *      the remaining space will be empty.
     * 
     *  - Currently this only works within the ship's system.
     *      Intersystem route plotting is the future. #TODO
     * 
     * PARAMETERS
     *  - range: Number. Default 0
     *      The range in units to limit the destinations.
     *
     *  - fuelMargin: Number. Default 5
     *      The error margin in % (ex. 5 is 5%) for fuel.
     *      It will include extra FUEL based on this parameter.
     * 
     * @param params INavigationParameters
     * @param strict boolean Default false. Throws errors instead of void returns;
     * @returns ITradeRoute     { destination: ILocation, cargo: ICargo[] }
     */
    public navigate(params: INavigationParameters = { range: 0, fuelMargin: 5 }, strict: boolean = false): ITradeRoute {
        let trades: ITradeOption[] = this._tradeOptions;
        
        // Check if any profitable trades where found
        if (!trades.length) {
            if (strict) {
                throw new Error("No profitable trades found from this ship's position");
            } else {
                return;
            }
        }

        // Filter trades by range
        if (params.range) {
            trades = this._tradeOptions.filter((option: ITradeOption) => Mentat.validateRange(this._ship, params.range, option.trade.destination));

            // Check if any profitable trades where found in specified range
            if (!trades.length) {
                if (strict) {
                    throw new Error("No profitable trades found in the specified range");
                } else {
                    return;
                }

            }
        }

        /**
         *  At this point all available trades are sanitized
         *      - They have available quantities for purchase
         *      - They are profitable
         *      - They are in range if specified
         */

        let fuelToTravel: number;
        let fuelQuantity: number;
        let fuelVolume: number;
        let localFuel: IGood;
        let destination: ILocation;

        // Get the first destination that can be fueled
        for (let i = 0; i < trades.length; i++) {
            let trade: ITrade = trades[i].trade;

            fuelToTravel = Mentat.calculateFuelToTravel(this._ship, this.currentLocation, trade.destination);
            fuelQuantity = Mentat.calculateFuelQuantity(this._ship, fuelToTravel, params.fuelMargin);
            fuelVolume = Mentat.calculateFuelToTravelVolume(fuelQuantity);
            localFuel = this.currentMarketplace.filter((g: IGood) => g.symbol === "FUEL")[0];
    
            // Check if there is enough available fuel in market for refueling
            if (fuelQuantity > (localFuel?.quantityAvailable || 0)) {
                // throw new Error("Not enough available fuel for this trip");

                // Remove from available trades as it is not possible
                trades.splice(i, 1);
                continue;
            }
    
            // Check if there is enough space for refuel
            if (this._ship.spaceAvailable < fuelQuantity) {
                // throw new Error("Not enough space for refuel");

                // Remove from available trades as it is not possible
                trades.splice(i, 1);
                continue;
            }

            // Get first destination that we have enough available fuel to travel to.
            destination = trade.destination;
            break;
        }

        // Check if a destination was found that can be fueled.
        if (!destination) {
            if (strict) {
                throw new Error("Not able to fuel a profitable trip");
            } else {
                return;
            }
        }

        /**
         * At this point the destination is set the trip is possible
         * 
         * Since any possible trade on another destination is not important,
         * they can be removed from the trades list to make filling up extra cargo easier
         */
        trades = trades.filter((option: ITradeOption) => option.trade.destination.symbol === destination.symbol);

        /**
         * Setup the cargo list and add the fuel needed for the trip.
         * This will be filled with the best cargo for trade.
         * If there is more space left, it will take the next best cargo and so on.
         */
        let cargo: ICargo[] = [
            {
                good: "FUEL",
                quantity: fuelQuantity,
                totalVolume: fuelVolume
            }
        ];

        // Start keeping track of the remaining cargo space
        let remainingSpace = Mentat.calculateRemainingSpaceAfterRefuel(this._ship, fuelQuantity);

        // Loop through valid trades and fill up remaining cargo space
        for (let i = 0; i < trades.length; i++) {
            // Check for remaining space and stop trying to fill cargo if none left
            if (remainingSpace <= 0) {
                break;
            }

            let trade: ITrade = trades[i].trade;
            let goodQuantity = Mentat.calculateGoodQuantity(remainingSpace, trade.localGood.volumePerUnit);

            // Check if the required good is a available in the quantity needed and set to max
            if (goodQuantity > trade.localGood.quantityAvailable) {
                goodQuantity = trade.localGood.quantityAvailable
            }

            let goodVolume = Mentat.calculateGoodVolume(goodQuantity, trade.localGood);

            cargo.push({
                good: trade.localGood.symbol,
                quantity: goodQuantity,
                totalVolume: goodVolume
            });

            // Adjust remaining space and if there is more space left buy next best Good for destination if exists
            remainingSpace -= goodVolume;
        }
            
        // Finally, return the object containing the destination and the cargo-to-buy for trading
        return { destination, cargo };
    }

    /**
     * The foundation of the algorithm.
     * 
     * This will provide all available trades from the ship's location
     * sorted by profit per distance unit.
     * 
     * Runs on the class's updates (location or ship) and on initialization to save up time.
     * 
     * @returns ITradeOption[]
     */
    private sortTradeOptions(): void {
        let trades: { trade: ITrade, profitPerDU: number }[] = [];

        // Validate that current location has a marketplace and can trade
        if (!this._currentLocation.marketplace || !this._currentLocation.marketplace.length) {
            return;
        }

        // Loop through locations
        for (let i = 0; i < this._locations.length; i++) {
            if (this._locations[i].symbol === this._currentLocation.symbol) {
                continue;
            }

            // Set marketplace if it exists in location
            let marketplace: IGood[];
            if (this._locations[i].marketplace && this._locations[i].marketplace.length) {
                marketplace = this._locations[i].marketplace;
            } else {
                continue;
            }

            // Loop through goods in marketplace
            for (let j = 0; j < marketplace.length; j++) {
                let destinationGood: IGood = marketplace[j];

                // Get local good to check if destination good exists on ship's location market
                let localGood: IGood;
                for (let k = 0; k < this._currentLocation.marketplace.length; k++) {
                    if (this._currentLocation.marketplace[k].symbol === destinationGood.symbol) {
                        localGood = this._currentLocation.marketplace[k];
                        break;
                    }
                }

                // Check if good exists in local market and has at least 1 quantity available
                if (localGood && localGood.quantityAvailable > 0) {
                    // Calculate Profit per Distance Unit and push to trades pool
                    let destination: ILocation = this._locations[i];

                    let profitPerDU: number = Mentat.calculateProfitPerDU(
                        destinationGood,                // aGood
                        localGood,                      // bGood
                        this._ship,                     // ship
                        this.currentLocation,           // location
                        destination,                    // destination
                        this.getCurrentFuelUnitCost()   // fuelUnitCost
                    );

                    // Set only profitable trades
                    if (profitPerDU > 0) {
                        trades.push({
                            trade: { destination, localGood, destinationGood },
                            profitPerDU
                        });
                    }   
                } else {
                    continue;
                }
            }
        }

        this._tradeOptions = Mentat.sortByKey(trades, "profitPerDU");

        // For debuging - TODO: Move functionality to tests
        this.logTradeOptions();
    }

    /**
     * 
     */
    private setProperties(): void {
        this._currentLocation = this.getCurrentLocation();
        this._currentMarketplace = this.getCurrentMarketplace();
        this._currentFuelUnitCost = this.getCurrentFuelUnitCost();
    }

    /**
     * 
     * @returns ILocation
     */
    private getCurrentLocation(): ILocation {
        for (let i = 0; i < this._locations.length; i++) {
            if (this._ship.location === this._locations[i].symbol) {
                return this._locations[i];
            }
        }

        return null;
    }

    /**
     * 
     * @returns IGood[]
     */
    private getCurrentMarketplace(): IGood[] {
        for (let i = 0; i < this._locations.length; i++) {
            if (this._ship.location === this._locations[i].symbol) {
                return this._locations[i].marketplace;
            }
        }

        return null;
    }

    /**
     * 
     * @returns number
     */
    private getCurrentFuelUnitCost(): number {
        const marketplace: IGood[] = this.getCurrentMarketplace();
        for (let i = 0; i < marketplace.length; i++) {
            if (marketplace[i].symbol === "FUEL") {
                return marketplace[i].purchasePricePerUnit;
            }
        }

        return null;
    }


    /**
     * TODO: Move to tests
     */
    private logTradeOptions(): void {
        this._tradeOptions.forEach(option => {
            let fuelQuantity: number = Mentat.calculateFuelToTravel(this._ship, this.currentLocation, option.trade.destination);
            let remainingSpace: number = Mentat.calculateRemainingSpaceAfterRefuel(this._ship, fuelQuantity);
            let goodQuantity: number = Mentat.calculateGoodQuantity(remainingSpace, option.trade.localGood.volumePerUnit);

            let goodCost: number = Mentat.calculateGoodCost(option.trade.localGood, goodQuantity);
            let fuelCost: number = Mentat.calculateFuelToTravelCost(fuelQuantity, this._currentFuelUnitCost);

            let goodProfit: number = Mentat.calculateGoodProfit(option.trade.destinationGood, goodQuantity);
            let profit: number = goodProfit - goodCost - fuelCost;

            console.log({
                trip: `${this._currentLocation.symbol} -> ${option.trade.destination.symbol}`,
                distance: Mentat.calculateLocationDistance(this._currentLocation, option.trade.destination),
                profitPerDU: option.profitPerDU,
                goodProfit,
                profit,
                good: option.trade.localGood.symbol,
                goodQuantity,
                goodCost,
                fuelQuantity,
                fuelCost
            });
        });
    }
}