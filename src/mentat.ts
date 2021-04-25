import { IShip, ILocation, IGood, ICargo } from './interfaces/index.js';
import { ShipClass } from './enums/index.js';

/**
 * Named after Mentats from Frank Herbert's "Dune".
 * https://dune.fandom.com/wiki/Mentat
 * https://en.wikipedia.org/wiki/Dune_(novel)
 */
export class Mentat {
    /**
     * Kudos to Redcrafter
     * 
     * @param ship IShip
     * @param location ILocation
     * @param destination ILocation
     * @returns number
     */
    public static calculateFuelToTravel(ship: IShip, location: ILocation, destination: ILocation): number {
        const isPlanet = location.type == "PLANET";

        let penalty = 0;
        let multiplier = .25;

        switch (ship.type) {
            case ShipClass.HM_MK_III:
                multiplier = 0.188;
                penalty = isPlanet ? 1 : 0;
                break;

            case ShipClass.GR_MK_III:
                penalty = isPlanet ? 4 : 0;
                break;

            case ShipClass.GR_MK_II:
                penalty = isPlanet ? 3 : 0;
                break;

            default:
                penalty = isPlanet ? 2 : 0;
                break;
        }

        return Math.round(Math.round(Mentat.calculateLocationDistance(location, destination)) * multiplier) + penalty + 1;
    }

    /**
     * 
     * @param ship IShip
     * @param fuelToTravel number
     * @returns number
     */
    public static calculateFuelQuantity(ship: IShip, fuelToTravel: number, margin: number = 0): number {
        let currentFuel: number = ship.cargo.filter((c: ICargo) => c.good === "FUEL")[0]?.quantity || 0;
        let quantity: number = currentFuel >= fuelToTravel ? 0 : fuelToTravel - currentFuel;
        return Math.ceil(quantity * (1 + (0.01 * margin)));
    }

    /**
     * 
     * @param ax number
     * @param ay number
     * @param bx number
     * @param by number
     * @returns number
     */
    public static calculateDistance(ax: number, ay: number, bx: number, by: number): number {
        return Math.sqrt(Math.abs(Math.pow(ax - bx, 2)) + Math.abs(Math.pow(ay - by, 2)));
    }

    /**
     * 
     * @param a ILocation
     * @param b ILocation
     * @returns number
     */
    public static calculateLocationDistance(a: ILocation, b: ILocation): number {
        return Mentat.calculateDistance(a.x, a.y, b.x, b.y);
    }

    /**
     * 
     * @param pricePerUnit number
     * @param volumePerUnit number
     * @returns number
     */
    public static calculatePricePerVolume(pricePerUnit: number, volumePerUnit: number): number {
        return pricePerUnit / volumePerUnit;
    }

    /**
     * 
     * @param a IGood Destination Good
     * @param b IGood Current Location Good
     * @returns number
     */
    public static calculateGoodProfitPerVol(a: IGood, b: IGood): number {
        let aPpV: number = Mentat.calculatePricePerVolume(a.sellPricePerUnit, a.volumePerUnit);
        let bPpV: number = Mentat.calculatePricePerVolume(b.purchasePricePerUnit, b.volumePerUnit);

        return aPpV - bPpV;
    }

    /**
     * 
     * @param good IGood
     * @param amount number
     * @returns number
     */
    public static calculateGoodProfit(good: IGood, amount: number): number {
        return good.sellPricePerUnit * amount;
    }

    /**
     * 
     * @param good IGood
     * @param amount number
     * @returns number
     */
     public static calculateGoodCost(good: IGood, amount: number): number {
        return good.purchasePricePerUnit * amount;
    }
    
    /**
     * 
     * @param amount number
     * @param unitCost number
     * @returns number
     */
    public static calculateFuelToTravelCost(amount: number, unitCost: number): number {
        return amount * unitCost;
    }

    /**
     * 
     * @param good IGood
     * @param amount number
     * @returns number
     */
    public static calculateCargoVolume(good: IGood, amount: number): number {
        return amount * good.volumePerUnit;
    }

    /**
     * 
     * Sidenote: For different floor methods
     * https://stackoverflow.com/questions/38702724/math-floor-vs-math-trunc-javascript
     * 
     * @param space number
     * @param volumePerUnit number
     * @returns number
     */
    public static calculateGoodQuantity(space: number, volumePerUnit: number): number {
        return Math.floor(Math.floor(space / volumePerUnit));
    }

    /**
     * 
     * @param aGood IGood   Destination Good
     * @param bGood IGood   Current Location Good
     * @param ship IShip
     * @param location ILocation
     * @param destination ILocation
     * @param fuelUnitCost number
     * @returns number
     */
    public static calculateProfitPerDU(aGood: IGood, bGood: IGood, ship: IShip, location: ILocation, destination: ILocation, fuelUnitCost: number): number {
        let distance: number = Mentat.calculateLocationDistance(location, destination);

        if (distance) {
            let fuel: number = Mentat.calculateFuelToTravel(ship, location, destination);
            let fuelCost: number = Mentat.calculateFuelToTravelCost(fuel, fuelUnitCost);
            let goodProfitPerVol: number = Mentat.calculateGoodProfitPerVol(aGood, bGood);
            let profit: number = (goodProfitPerVol * (ship.spaceAvailable - fuel)) - fuelCost;

            return profit / distance;
        }

        return 0;
    }

    /**
     * 
     * @param amount number
     * @returns number
     */
    public static calculateFuelToTravelVolume(amount: number): number {
        // Currently fuel is only 1 so I just hardcode the value.
        // This should be moved to some constant so it can be controlled outside this function.
        return amount * 1;
    }

    /**
     * 
     * @param amount number
     * @param good IGood
     * @returns number
     */
    public static calculateGoodVolume(amount: number, good: IGood): number {
        return amount * good.volumePerUnit;
    }

    /**
     * 
     * @param ship IShip
     * @param fuelQuantity number
     * @returns number
     */
    public static calculateRemainingSpaceAfterRefuel(ship: IShip, fuelQuantity: number): number {
        return ship.spaceAvailable - Mentat.calculateFuelToTravelVolume(fuelQuantity);
    }

    /**
     * 
     * @param ship IShip
     * @param range number
     * @param location ILocation
     * @returns boolean
     */
    public static validateRange(ship: IShip, range: number, location: ILocation): boolean {
        return range > Mentat.calculateDistance(ship.x, ship.y, location.x, location.y);
    }

    /**
     * 
     * TODO: Move this to a helper class. Mentat only does calculations and verifications.
     * 
     * @param arr any[]
     * @param key string
     * @returns any[]
     */
    public static sortByKey(arr: any[], key: string): any[] {
        arr.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });

        return arr;
    }
}