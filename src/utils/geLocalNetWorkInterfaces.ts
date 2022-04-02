import * as os from 'os';

export interface LocalNetWorkInterface {
    name: string;
    address: string;
    netmask: string;
    mac: string;
    family: string;
}

export function geLocalNetWorkInterfaces(networkNames?: string[]) {

    if (networkNames === undefined || networkNames.length === 0) {
        return undefined;
    }

    const ipv4s = new Map<string, LocalNetWorkInterface>();
    const ipv6s = new Map<string, LocalNetWorkInterface>();

    const networksObj = os.networkInterfaces();
    for (let nw in networksObj) {
        let objArr = networksObj[nw];
        if (objArr) {
            objArr.forEach((obj, idx, arr) => {
                networkNames.forEach(ispName => {
                    if (nw.indexOf(ispName) !== -1) {
                        const newObject = Object.assign(obj, { name: ispName }) as LocalNetWorkInterface;
                        const address = newObject.address.substring(0, 17);
                        if (newObject.family === 'IPv4') {
                            if (!ipv4s.has(address)) {
                                ipv4s.set(address, newObject);
                            }
                        }
                        if (newObject.family === 'IPv6') {

                            if (newObject.address.split(":").length === newObject.netmask.split(":").length) {
                                if (!ipv6s.has(address)) {
                                    ipv6s.set(address, newObject);
                                }
                            }
                        }
                    }
                });
            });
        } else {
            return undefined;
        }

    }
    return { ipv4s, ipv6s };
}