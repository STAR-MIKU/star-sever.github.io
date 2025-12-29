import fs from 'node:fs';

export function binaryLoader(options = {}) {
    const binRegex = /\?binary$/;
    return {
        name: 'binary-loader',
        enforce: 'pre',

        async load(id) {
            if (!id.match(binRegex)) {
                return;
            }
            const [path, query] = id.split('?', 2);

            try {
                const data = fs.readFileSync(path);
                return {
                    code: `export default new Uint8Array(${JSON.stringify(Array.from(data))})`,
                    map: null
                };
            } catch (ex) {
                console.warn(
                    ex,
                    '\n',
                    `${id} couldn't be loaded by binary-loader, fallback to default loader`
                );
                return;
            }
        },
    };
}

export default binaryLoader;
