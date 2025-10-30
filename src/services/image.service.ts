import fs from 'fs';
import path from 'path';
import { Country } from '../types';

let createCanvas: any;
let canvasAvailable = true;

try {
    const canvas = require('canvas');
    createCanvas = canvas.createCanvas;
} catch (error) {
    console.warn('⚠️  Canvas not available - image generation will be disabled');
    canvasAvailable = false;
}

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
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(1, '#312e81');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Country Data Summary', width / 2, 60);

        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Total Countries: ${totalCountries}`, width / 2, 120);

        ctx.font = 'bold 20px Arial';
        ctx.fillText('Top 5 Countries by Estimated GDP', width / 2, 170);

        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
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
            ctx.fillText(text, 100, yPos);
            yPos += 40;
        });

        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Last Refreshed: ${lastRefreshed}`, width / 2, height - 40);

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