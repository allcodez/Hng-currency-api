# Hng Currency Api

A RESTful API built with Express.js, TypeScript, and MySQL that fetches country data from external APIs, calculates estimated GDP, and provides comprehensive CRUD operations.

## Features

- 🌍 Fetch and cache country data from RestCountries API
- 💱 Integrate real-time exchange rates
- 📊 Calculate estimated GDP for each country
- 🖼️ Generate summary images with top countries
- 🔍 Filter and sort countries by region, currency, and GDP
- 🗄️ MySQL database for data persistence

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd country-currency-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL database

Create a MySQL database:

```sql
CREATE DATABASE country_currency_db;
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=country_currency_db

# API URLs (default values, no need to change)
COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_API_URL=https://open.er-api.com/v6/latest/USD

# Cache Directory
CACHE_DIR=./cache
```

### 5. Initialize the database

The database tables will be created automatically when you start the server for the first time.

## Running the Application

### Development mode (with hot reload)

```bash
npm run dev
```

### Production build

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or your specified PORT).

## API Endpoints

### 1. Refresh Countries Data

**POST** `/countries/refresh`

Fetches all countries and exchange rates from external APIs, then caches them in the database.

```bash
curl -X POST http://localhost:3000/countries/refresh
```

**Response:**
```json
{
  "message": "Countries data refreshed successfully",
  "total_countries": 250
}
```

### 2. Get All Countries

**GET** `/countries`

Retrieve all countries with optional filters and sorting.

**Query Parameters:**
- `region` - Filter by region (e.g., `Africa`, `Europe`)
- `currency` - Filter by currency code (e.g., `NGN`, `USD`)
- `sort` - Sort results: `gdp_desc`, `gdp_asc`, `population_desc`, `population_asc`, `name_asc`, `name_desc`

**Examples:**

```bash
# Get all countries
curl http://localhost:3000/countries

# Filter by region
curl http://localhost:3000/countries?region=Africa

# Filter by currency
curl http://localhost:3000/countries?currency=NGN

# Sort by GDP (descending)
curl http://localhost:3000/countries?sort=gdp_desc

# Combine filters
curl http://localhost:3000/countries?region=Africa&sort=gdp_desc
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-28T18:00:00Z"
  }
]
```

### 3. Get Country by Name

**GET** `/countries/:name`

Retrieve a specific country by name.

```bash
curl http://localhost:3000/countries/Nigeria
```

**Response:**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-28T18:00:00Z"
}
```

### 4. Delete Country

**DELETE** `/countries/:name`

Delete a country record from the database.

```bash
curl -X DELETE http://localhost:3000/countries/Nigeria
```

**Response:**
```json
{
  "message": "Country deleted successfully"
}
```

### 5. Get Status

**GET** `/status`

Get API statistics including total countries and last refresh timestamp.

```bash
curl http://localhost:3000/status
```

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-28T18:00:00Z"
}
```

### 6. Get Summary Image

**GET** `/countries/image`

Retrieve the generated summary image showing top 5 countries by GDP.

```bash
curl http://localhost:3000/countries/image --output summary.png
```

Or open in browser: `http://localhost:3000/countries/image`

## Project Structure

```
country-currency-api/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── controllers/
│   │   └── country.controller.ts # Request handlers
│   ├── routes/
│   │   └── country.routes.ts     # API routes
│   ├── services/
│   │   ├── country.service.ts    # Database operations
│   │   ├── externalAPI.service.ts # External API calls
│   │   ├── image.service.ts      # Image generation
│   │   └── refresh.service.ts    # Data refresh logic
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── index.ts                  # App entry point
├── cache/                        # Generated images
├── .env                          # Environment variables
├── .env.example                  # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

## Error Handling

The API returns consistent JSON error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "currency_code": "is required"
  }
}
```

### 404 Not Found
```json
{
  "error": "Country not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

### 503 Service Unavailable
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from RestCountries API"
}
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MySQL2** - Database driver
- **Axios** - HTTP client
- **Canvas** - Image generation
- **dotenv** - Environment configuration

## Deployment

This API can be deployed to various platforms:

### Railway
1. Create a new project on Railway
2. Add MySQL database service
3. Connect your GitHub repository
4. Add environment variables
5. Deploy!



## Development

### Running tests

```bash
npm test
```

### Building for production

```bash
npm run build
```

### Code formatting

```bash
npm run format
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Express.js and TypeScript**