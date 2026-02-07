import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Evasion',
        short_name: 'Evasion',
        description: 'Social Navigation for Car Enthusiasts',
        start_url: '/',
        display: 'standalone',
        background_color: '#06040A',
        theme_color: '#06040A',
        icons: [
            {
                src: '/images/evasion-logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/checkered-flag.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
