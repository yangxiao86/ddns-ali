
import * as http from 'http';
import { log } from './log';

export async function getNetIp(localAddress?: string): Promise<string> {
    if (localAddress && localAddress.length > 19) {
        return localAddress;
    }
    return new Promise((resolve, reject) => {

        const options = {
            hostname: 'ifconfig.co',
            method: 'GET',
            path: '/ip',
            localAddress
        };

        const req = http.request(options, (res) => {

            res.setEncoding('utf8');
            res.on('data', (chunk: string) => {
                chunk = chunk.replace('\n', '');
                log(`获取公网IP: ${localAddress || '默认'} -> ${chunk}`);
                resolve(chunk);
            });
            // res.on('end', () => {
            //     resolve('');
            // });
        });

        req.on('error', (e) => {
            reject(`problem with request: ${e.message}`);
        });

        //   req.write(postData);
        req.end();
    });


}
