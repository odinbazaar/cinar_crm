const axios = require('axios');
const fs = require('fs');
const path = require('path');

const fontDir = path.join(__dirname, 'src', 'assets', 'fonts');
if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
}

const fonts = [
    {
        name: 'Roboto-Regular.ttf',
        url: 'https://raw.githubusercontent.com/googlefonts/roboto/master/src/hinted/Roboto-Regular.ttf'
    },
    {
        name: 'Roboto-Bold.ttf',
        url: 'https://raw.githubusercontent.com/googlefonts/roboto/master/src/hinted/Roboto-Bold.ttf'
    }
];

async function downloadFonts() {
    for (const font of fonts) {
        const filePath = path.join(fontDir, font.name);
        console.log(`Downloading ${font.name}...`);

        try {
            const response = await axios({
                method: 'GET',
                url: font.url,
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            console.log(`✅ ${font.name} downloaded successfully.`);
        } catch (err) {
            console.error(`❌ Error downloading ${font.name}: ${err.message}`);
        }
    }
}

downloadFonts();
