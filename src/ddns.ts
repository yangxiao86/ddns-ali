import { geLocalNetWorkInterfaces, LocalNetWorkInterface } from './utils/geLocalNetWorkInterfaces';
import { getNetIp } from './utils/getNetworkIp';
import { log } from './utils/log';

interface AliyunUpdateDomainRecordResponse {
    RequestId: string,
    RecordId: string
}

interface AliyunDescribeDomainRecords {
    RequestId: string,
    TotalCount: number,
    PageNumber: number,
    PageSize: number,
    DomainRecords: {
        Record: AliyunRecord[]
    }
}

interface AliyunRecord {
    DomainName: string, // example.com
    RecordId: string, // 99999985
    RR: string, // www
    Type: string, // MX
    Value: string, // mail1.hichina.com
    Line: string, // default
    Priority: number, // 5
    TTL: number, // 600
    Status: string, // Enable
    Locked: boolean, // false
}

// 获取域名解析记录
async function getDescribeDomainRecords(subDomain: string, mainDomain: string): Promise<AliyunRecord[]> {
    const res: AliyunDescribeDomainRecords = await config.aliyunCore.request('DescribeDomainRecords', {
        DomainName: mainDomain,
        PageSize: 100,
        KeyWord: subDomain,
    }, {
        method: 'POST'
    });
    if (res) {
        return res.DomainRecords.Record;
    } else {
        return [] as any;
    }
}

async function UpdateDomainRecord(RecordId: string, RR: string, Value: string): Promise<AliyunUpdateDomainRecordResponse | undefined> {

    const res: AliyunUpdateDomainRecordResponse = await config.aliyunCore.request('UpdateDomainRecord', {
        RecordId,
        RR,
        Type: 'A',
        Value
    }, {
        method: 'POST'
    });
    if (res) {
        return res;
    } else {
        return undefined;
    }
}

async function updateRecord(domain: string, networkIp: string, localObj: LocalNetWorkInterface) {

    const subDomain = domain.split('.').slice(0, domain.split('.').length - 2).join('.');
    const mainDomain = domain.split('.').slice(-2).join('.');

    const domainRecords = await getDescribeDomainRecords(subDomain, mainDomain);
    if (domainRecords && domainRecords.length > 0) {
        // 匹配已有记录是否存在
        for (let i = 0; i < domainRecords.length; i++) {
            const item = domainRecords[i]

            if (item.RR === subDomain) {
                if (item.Value === networkIp) {
                    log(`无需更新`);
                    return;
                } else {
                    const record = await UpdateDomainRecord(item.RecordId, subDomain, networkIp);// 记录不一致
                    if (record) {
                        log(`更新成功:(${localObj.name})->${localObj.address}->${networkIp}->${domain}`);
                    }
                    return record;
                }
            }
        }
    } else {
        log(`没有找到更新的域名，建议在阿里云控制台添加域名`);
    }

    return;
}


export interface IConfig {
    AccessKey: string;
    AccessKeySecret: string;
    IPVersion: '6' | '4';
    DomainObj: {
        ethernet: string[];
        domain: string[];
    };
    Domain: string[];
    Ethernets: string[];
    aliyunCore: any
};

let config = {} as IConfig;
const Core = require('@alicloud/pop-core');

export async function mian(c: IConfig) {

    if (!c.AccessKey || !c.AccessKeySecret || !c.Domain.length) {
        log('配置参数异常AccessKey｜AccessKeySecret｜Domain');
        return
    }

    config = c;

    config.aliyunCore = new Core({
        accessKeyId: config.AccessKey,
        accessKeySecret: config.AccessKeySecret,
        endpoint: 'https://alidns.aliyuncs.com',
        apiVersion: '2015-01-09'
    });

    let records: AliyunUpdateDomainRecordResponse[] = [];
    const ip = geLocalNetWorkInterfaces(config.Ethernets);
    // console.log("==>ip", ip);
    if (ip) { // 多IP
        let i = 0;
        const ipvs = config.IPVersion === '4' ? ip.ipv4s : ip.ipv6s;
        const values: LocalNetWorkInterface[] = [];

        ipvs.forEach(value => {
            values.push(value);
        })

        for (let key in values) {
            const value = values[key];
            const networkIp = await getNetIp(value.address);
            if (networkIp) {
                let index = config.Ethernets.indexOf(value.name);
                index = index === -1 ? 0 : index;
                log(`准备更新：${config.Domain[index]} -> ${networkIp}`);
                const record = await updateRecord(config.Domain[index], networkIp, value);
                await i++;
                if (record) {
                    records.push(record);
                }

            }
        }
    } else { // 单IP
        const networkIp = await getNetIp();
        const networkInfo: LocalNetWorkInterface = {
            name: '默认',
            address: '默认',
            family: "默认",
            mac: "默认",
            netmask: "默认"
        }
        const record = await updateRecord(config.Domain[0], networkIp, networkInfo);
        if (record) {
            records.push(record);
        }
    }
    return records;
}

