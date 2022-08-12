import got from 'got';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import randomHex from 'random-hex';

const getColor = (color) => `${color ? '#' + color : randomHex.generate()}`;

const template = (content, opts) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mono Demo</title>
    <link rel="stylesheet" href="https://monocss.vercel.app/assets/index.2cee2012.css">
</head>
<body class="mono-all" style="--mono-main: ${getColor(opts.main)}; --mono-back: ${getColor(opts.back)};">
    <main>${content}</main>
</body>
</html>`;

const hint = '<p>You may use `main` and `back` in query to select colors.</p>';

const form = `<form>
    <input name="url">
    <input type="submit">
</form>`;

const response = (content, opts) => ({
    statusCode: 200,
    body: template(content, opts)
});

export const handler = async (event) => {
    const { main, back } = event.queryStringParameters;
    let url = event.queryStringParameters.url;

    if (!url || !url.endsWith('.md')) {
        return response('<h1>Mono</h1><h2>Enter URL of any markdown file</h2>' + hint + form, { main, back });
    }

    if (url.startsWith('https://github.com')) {
        url = url
            .replace('/blob', '')
            .replace('github.com', 'raw.githubusercontent.com');
    }

    try {
        const md = await got(url).then(r => r.body);
        const processedMd = await remark().use(remarkHtml).process(md);

        return response(processedMd.value, { main, back });
    } catch (err) {
        return response('<h1>Error</h1><h2>Try another markdown URL</h2>' + hint + form, { main, back });
    }
};
