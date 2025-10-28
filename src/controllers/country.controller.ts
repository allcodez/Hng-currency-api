import { Request, Response } from 'express';
import { CountryService } from '../services/country.service';
import { RefreshService } from '../services/refresh.service';
import { ImageService } from '../services/image.service';
import { StatusResponse, ErrorResponse } from '../types';

const countryService = new CountryService();
const refreshService = new RefreshService();
const imageService = new ImageService();

export class CountryController {
    async refreshCountries(req: Request, res: Response): Promise<void> {
        try {
            const result = await refreshService.refreshCountries();
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Could not fetch data')) {
                const response: ErrorResponse = {
                    error: 'External data source unavailable',
                    details: error.message
                };
                res.status(503).json(response);
            } else {
                console.error('Refresh error:', error);
                const response: ErrorResponse = {
                    error: 'Internal server error'
                };
                res.status(500).json(response);
            }
        }
    }

    async getAllCountries(req: Request, res: Response): Promise<void> {
        try {
            const filters = {
                region: req.query.region as string | undefined,
                currency: req.query.currency as string | undefined,
                sort: req.query.sort as string | undefined
            };

            const countries = await countryService.getAllCountries(filters);
            res.status(200).json(countries);
        } catch (error) {
            console.error('Get all countries error:', error);
            const response: ErrorResponse = {
                error: 'Internal server error'
            };
            res.status(500).json(response);
        }
    }

    async getCountryByName(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.params;

            if (!name || name.trim() === '') {
                const response: ErrorResponse = {
                    error: 'Validation failed',
                    details: {
                        name: 'is required'
                    }
                };
                res.status(400).json(response);
                return;
            }

            const country = await countryService.getCountryByName(name);

            if (!country) {
                const response: ErrorResponse = {
                    error: 'Country not found'
                };
                res.status(404).json(response);
                return;
            }

            res.status(200).json(country);
        } catch (error) {
            console.error('Get country by name error:', error);
            const response: ErrorResponse = {
                error: 'Internal server error'
            };
            res.status(500).json(response);
        }
    }

    async deleteCountry(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.params;

            if (!name || name.trim() === '') {
                const response: ErrorResponse = {
                    error: 'Validation failed',
                    details: {
                        name: 'is required'
                    }
                };
                res.status(400).json(response);
                return;
            }

            const deleted = await countryService.deleteCountry(name);

            if (!deleted) {
                const response: ErrorResponse = {
                    error: 'Country not found'
                };
                res.status(404).json(response);
                return;
            }

            res.status(200).json({ message: 'Country deleted successfully' });
        } catch (error) {
            console.error('Delete country error:', error);
            const response: ErrorResponse = {
                error: 'Internal server error'
            };
            res.status(500).json(response);
        }
    }

    async getStatus(req: Request, res: Response): Promise<void> {
        try {
            const totalCountries = await countryService.getTotalCountries();
            const lastRefreshedAt = await countryService.getLastRefreshedAt();

            const response: StatusResponse = {
                total_countries: totalCountries,
                last_refreshed_at: lastRefreshedAt
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Get status error:', error);
            const response: ErrorResponse = {
                error: 'Internal server error'
            };
            res.status(500).json(response);
        }
    }

    async getSummaryImage(req: Request, res: Response): Promise<void> {
        try {
            if (!imageService.summaryImageExists()) {
                const response: ErrorResponse = {
                    error: 'Summary image not found'
                };
                res.status(404).json(response);
                return;
            }

            const imagePath = imageService.getSummaryImagePath();
            res.sendFile(imagePath, { root: process.cwd() });
        } catch (error) {
            console.error('Get summary image error:', error);
            const response: ErrorResponse = {
                error: 'Internal server error'
            };
            res.status(500).json(response);
        }
    }
}