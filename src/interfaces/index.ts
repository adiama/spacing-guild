export interface IGood {
    quantityAvailable: number;
    volumePerUnit: number;
    pricePerUnit: number;
    spread: number;
    purchasePricePerUnit: number;
    sellPricePerUnit: number;
    symbol: string;
}

export interface ILocation {
    symbol: string;
    type: string;
    name: string;
    x: number;
    y: number;
    marketplace?: IGood[];
}

export interface ICargo {
    good: string;
    quantity: number;
    totalVolume: number;
}

export interface IShip {
    id: string;
    location: string;
    x: number;
    y: number;
    cargo: ICargo[];
    spaceAvailable: number;
    type: string;
    class: string;
    maxCargo: number;
    speed: number;
    manufacturer: string;
    plating: number;
    weapons: number;
}

export interface ITradeRoute {
    destination: ILocation;
    cargo: ICargo[];
}

export interface ITrade {
    destination: ILocation;
    localGood: IGood;
    destinationGood: IGood;
}

export interface ITradeOption {
    trade: ITrade;
    profitPerDU: number;
}

export interface INavigationParameters {
    range: number;
    fuelMargin: number;
}