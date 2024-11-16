import UserAgent from 'user-agents';
import { faker } from '@faker-js/faker';

type FakeClientHeaders = {
    'User-Agent': string;
    'accept': string;
    'accept-language': string;
    'cache-control': string;
    'priority': string;
    'sec-ch-ua': string;
    'sec-ch-ua-mobile': string;
    'sec-ch-ua-platform': string;
    'sec-fetch-dest': string;
    'sec-fetch-mode': string;
    'sec-fetch-site': string;
    'sec-fetch-user': string;
    'upgrade-insecure-requests': string;
};

export default function getFakeClient(): FakeClientHeaders {
    const userAgent = new UserAgent().toString();

    // Genera un valore casuale per 'accept-language'
    const acceptLanguageOptions = ['en-US', 'it-IT', 'fr-FR', 'de-DE', 'es-ES', 'ja-JP'];
    const acceptLanguage = faker.helpers.arrayElement(acceptLanguageOptions);

    // Creazione manuale di un accept header randomizzato
    const acceptValues = [
        'text/html',
        'application/xhtml+xml',
        'application/xml;q=0.9',
        'image/avif',
        'image/webp',
        'image/apng',
        '*/*;q=0.8',
        'application/signed-exchange;v=b3;q=0.7',
    ];
    const acceptHeader = acceptValues.join(',');

    return {
        'User-Agent': userAgent,
        'accept': acceptHeader, // Header costruito manualmente
        'accept-language': acceptLanguage, // Lingua scelta casualmente
        'cache-control': 'max-age=0',
        'priority': 'u=0, i',
        'sec-ch-ua': `"Chromium"v="${faker.system.semver()}", "NotA=Brand"v="24", "Google Chrome"v="${faker.system.semver()}"`,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': `"Windows"`,
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
    };
}
