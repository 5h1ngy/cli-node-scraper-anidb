// import { HeaderGenerator } from 'header-generator'
import UserAgent from 'user-agents'

export default function getFakeClient() {
    const userAgent = new UserAgent()
    // console.warn('FAKE userAgent', userAgent.toString())

    // let headerGenerator = new HeaderGenerator({
    //     browsers: [
    //         { name: "firefox", minVersion: 80 },
    //         { name: "chrome", minVersion: 87 },
    //     ],
    //     devices: [
    //         "desktop"
    //     ],
    //     operatingSystems: [
    //         "windows"
    //     ]
    // })

    return {
        'User-Agent': userAgent.toString(),
        'accept': 'text/html,application/xhtml+xml,application/xmlq=0.9,image/avif,image/webp,image/apng,*/*q=0.8,application/signed-exchangev=b3q=0.7',
        'accept-language': 'it',
        'cache-control': 'max-age=0',
        'priority': 'u=0, i',
        'sec-ch-ua': '"Chromium"v="128", "NotA=Brand"v="24", "Google Chrome"v="128"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        //'user-agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    }
}