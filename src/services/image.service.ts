import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { Country } from '../types';

export class ImageService {
    private cacheDir: string;

    constructor() {
        this.cacheDir = process.env.CACHE_DIR || './cache';
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    async generateSummaryImage(
        totalCountries: number,
        topCountries: Country[],
        lastRefreshed: string
    ): Promise<string> {
        const width = 800;
        const height = 600;
        const canvas = createCanvas(width, height);
        const canvas2d = canvas.getContext('2d');

        const gradient = canvas2d.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(1, '#312e81');
        canvas2d.fillStyle = gradient;
        canvas2d.fillRect(0, 0, width, height);

        canvas2d.fillStyle = '#ffffff';
        canvas2d.font = 'bold 32px Arial';
        canvas2d.textAlign = 'center';
        canvas2d.fillText('Country Data Summary', width / 2, 60);

        canvas2d.font = 'bold 24px Arial';
        canvas2d.fillText(`Total Countries: ${totalCountries}`, width / 2, 120);

        canvas2d.font = 'bold 20px Arial';
        canvas2d.fillText('Top 5 Countries by Estimated GDP', width / 2, 170);

        canvas2d.font = '16px Arial';
        canvas2d.textAlign = 'left';
        let yPos = 210;

        topCountries.forEach((country, index) => {
            const gdp = country.estimated_gdp
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                }).format(country.estimated_gdp)
                : 'N/A';

            const text = `${index + 1}. ${country.name} - ${gdp}`;
            canvas2d.fillText(text, 100, yPos);
            yPos += 40;
        });

        // Last refreshed timestamp
        canvas2d.font = '14px Arial';
        canvas2d.textAlign = 'center';
        canvas2d.fillStyle = '#94a3b8';
        canvas2d.fillText(`Last Refreshed: ${lastRefreshed}`, width / 2, height - 40);

        // Save to file
        const imagePath = path.join(this.cacheDir, 'summary.png');
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(imagePath, buffer);

        return imagePath;
    }

    getSummaryImagePath(): string {
        return path.join(this.cacheDir, 'summary.png');
    }

    summaryImageExists(): boolean {
        return fs.existsSync(this.getSummaryImagePath());
    }
}