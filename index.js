import got from 'got';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import randomHex from 'random-hex';

const template = (content, opts) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mono Demo</title>
    <link rel="stylesheet" href="https://monocss.vercel.app/assets/index.2cee2012.css">
</head>
<body class="mono-all" style="--mono-main: ${opts.main ? '#' + opts.main : randomHex.generate()}; --mono-back: ${opts.back ? '#' + opts.back : randomHex.generate()};">
    ${content}
</body>
</html>`;

const hint = '<p>You may use `main` and `back` in query to select colors.';

const form = `<form>
    <input name="url">
    <input type="submit">
</form>`;

export const handler = async function (event, context) {
    const { main, back } = event.queryStringParameters;
    let url = event.queryStringParameters.url;

    if (!url || !url.endsWith('.md')) {
        return {
            statusCode: 200,
            body: template('<h1>Mono</h1><h2>Enter URL of any markdown file</h2>' + hint + form, { main, back })
        };
    }

    if (url.startsWith('https://github.com')) {
        url = url
            .replace('/blob', '')
            .replace('github.com', 'raw.githubusercontent.com');
    }

    try {
        const request = await got(url);
        const md = request.body;

        const processedMd = await remark().use(remarkHtml).process(md);
        return {
            statusCode: 200,
            body: template(processedMd.value, { main, back })
        };
    } catch (err) {
        return {
            statusCode: 200,
            body: template('<h1>Error</h1><h2>Try another markdown URL</h2>' + hint + form, { main, back })
        };
    }
};
