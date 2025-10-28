export interface Country {
    id?: number;
    name: string;
    capital?: string;
    region?: string;
    population: number;
    currency_code: string | null;
    exchange_rate: number | null;
    estimated_gdp: number | null;
    flag_url?: string;
    last_refreshed_at?: Date;
}

export interface CountryAPIResponse {
    name: string;
    capital?: string;
    region?: string;
    population: number;
    flag?: string;
    currencies?: Array<{
        code: string;
        name: string;
        symbol: string;
    }>;
}

export interface ExchangeRateAPIResponse {
    result: string;
    base_code: string;
    rates: {
        [key: string]: number;
    };
}

export interface StatusResponse {
    total_countries: number;
    last_refreshed_at: string | null;
}

export interface ErrorResponse {
    error: string;
    details?: any;
}