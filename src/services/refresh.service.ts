import { ExternalAPIService } from './externalAPI.service';
import { CountryService } from './country.service';
import { ImageService } from './image.service';
import { Country } from '../types';

export class RefreshService {
    private externalAPI: ExternalAPIService;
    private countryService: CountryService;
    private imageService: ImageService;

    constructor() {
        this.externalAPI = new ExternalAPIService();
        this.countryService = new CountryService();
        this.imageService = new ImageService();
    }

    private getRandomMultiplier(): number {
        return Math.random() * (2000 - 1000) + 1000;
    }

    private calculateEstimatedGDP(
        population: number,
        exchangeRate: number | null
    ): number | null {
        if (exchangeRate === null || exchangeRate === 0) {
            return null;
        }
        const multiplier = this.getRandomMultiplier();
        return (population * multiplier) / exchangeRate;
    }

    async refreshCountries(): Promise<{ message: string; total_countries: number }> {
        try {
            console.log('🔄 Starting country data refresh...');

            const [countriesData, exchangeRates] = await Promise.all([
                this.externalAPI.fetchCountries(),
                this.externalAPI.fetchExchangeRates()
            ]);

            console.log(`✅ Fetched ${countriesData.length} countries`);

            for (const countryData of countriesData) {
                let currencyCode: string | null = null;
                let exchangeRate: number | null = null;
                let estimatedGDP: number | null = null;

                if (countryData.currencies && countryData.currencies.length > 0) {
                    currencyCode = countryData.currencies[0].code;

                    if (currencyCode && exchangeRates[currencyCode]) {
                        exchangeRate = exchangeRates[currencyCode];
                        estimatedGDP = this.calculateEstimatedGDP(
                            countryData.population,
                            exchangeRate
                        );
                    } else {
                        exchangeRate = null;
                        estimatedGDP = null;
                    }
                } else {
                    currencyCode = null;
                    exchangeRate = null;
                    estimatedGDP = 0;
                }

                const country: Country = {
                    name: countryData.name,
                    capital: countryData.capital,
                    region: countryData.region,
                    population: countryData.population,
                    currency_code: currencyCode,
                    exchange_rate: exchangeRate,
                    estimated_gdp: estimatedGDP,
                    flag_url: countryData.flag
                };

                await this.countryService.upsertCountry(country);
            }

            console.log('✅ All countries saved to database');

            const timestamp = new Date().toISOString();
            await this.countryService.setLastRefreshedAt(timestamp);

            const totalCountries = await this.countryService.getTotalCountries();
            const topCountries = await this.countryService.getTopCountriesByGDP(5);

            // Try to generate image, but don't fail the entire refresh if it errors
            try {
                await this.imageService.generateSummaryImage(
                    totalCountries,
                    topCountries,
                    timestamp
                );
                console.log('✅ Summary image generated');
            } catch (imageError) {
                console.warn('⚠️  Image generation failed (non-critical):', imageError);
                // Continue - image generation is optional
            }

            console.log(`✅ Refresh complete: ${totalCountries} countries`);

            return {
                message: 'Countries data refreshed successfully',
                total_countries: totalCountries
            };
        } catch (error) {
            console.error('❌ Refresh failed:', error);
            if (error instanceof Error) {
                if (error.message.includes('Could not fetch data')) {
                    throw error;
                }
                // Include the actual error message for debugging
                console.error('Full error:', error.stack);
                throw new Error(`Failed to refresh countries data: ${error.message}`);
            }
            throw new Error('Failed to refresh countries data');
        }
    }
}