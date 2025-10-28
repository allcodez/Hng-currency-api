import axios from 'axios';
import { CountryAPIResponse, ExchangeRateAPIResponse } from '../types';

const COUNTRIES_API_URL = process.env.COUNTRIES_API_URL || 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL || 'https://open.er-api.com/v6/latest/USD';

export class ExternalAPIService {
    async fetchCountries(): Promise<CountryAPIResponse[]> {
        try {
            const response = await axios.get(COUNTRIES_API_URL, { timeout: 15000 });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Could not fetch data from RestCountries API: ${error.message}`);
            }
            throw error;
        }
    }

    async fetchExchangeRates(): Promise<{ [key: string]: number }> {
        try {
            const response = await axios.get<ExchangeRateAPIResponse>(EXCHANGE_API_URL, { timeout: 15000 });
            return response.data.rates;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Could not fetch data from Exchange Rate API: ${error.message}`);
            }
            throw error;
        }
    }
}