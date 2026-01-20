const http = require('https');
const fs = require('fs');
const path = require('path');

const fontDir = path.join(__dirname, 'src', 'assets', 'fonts');
if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
}

const fonts = [
    {
        name: 'Roboto-Regular.ttf',
        url: 'https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Regular.ttf'
    },
    {
        name: 'Roboto-Bold.ttf',
        url: 'https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Bold.ttf'
    }
];

fonts.forEach(font => {
    const filePath = path.join(fontDir, font.name);
    console.log(`Downloading ${font.name}...`);
    const file = fs.createWriteStream(filePath);
    http.get(font.url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close();
            console.log(`${font.name} downloaded successfully.`);
        });
    }).on('error', function (err) {
        fs.unlink(filePath);
        console.error(`Error downloading ${font.name}: ${err.message}`);
    });
});
