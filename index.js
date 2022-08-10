import express from 'express';
import got from 'got';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const app = express();

const template = (content) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mono Demo</title>
    <link rel="stylesheet" href="https://monocss.vercel.app/assets/index.2cee2012.css">
</head>
<body class="mono-all" style="--mono-main: #000000; --mono-back: #ffffff;">
    ${content}
</body>
</html>`;

const form = `<form>
    <input name="url">
    <input type="submit">
</form>`;

app.get('/', async (req, res) => {
    let url = req.query.url;

    if (!url || !url.endsWith('.md')) return res.send(template('<h2>Enter URL of any markdown file</h2>' + form));

    if (url.startsWith('https://github.com')) {
        url = url
            .replace('/blob', '')
            .replace('github.com', 'raw.githubusercontent.com');
    }

    try {
        const request = await got(url);
        const md = request.body;

        const processedMd = await remark().use(remarkHtml).process(md);
        res.send(template(processedMd.value));
    } catch(err) {
        res.send(template('<h2>Try another markdown URL</h2>' + form));
    }
});

app.listen(3000, () => {
    console.log('listening...');
});
