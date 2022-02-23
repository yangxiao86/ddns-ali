export function getArgv(key: string) {

    if (process.env[key]) {
        return process.env[key];
    }

    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '-' + key) {
            return process.argv[i + 1];
        }
    }
    return undefined;
}

// '10010&10010.xxxx.com,10086&10086.xxxx.com'
// 网卡名1&要绑定的域名1,网卡名2&要绑定的域名2
// 不能包含空格
export function getDomain(v?: string) {

    const ethernet: string[] = [];
    const domain: string[] = [];
    if (v) {
        const a = v.split(',');

        a.forEach(value => {
            const b = value.split('&');
            if (b.length === 1) {
                domain.push(b[0]);
            } else {
                ethernet.push(b[0]);
                domain.push(b[1]);
            }
        });
    }

    return { ethernet, domain };
}