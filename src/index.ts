#!/usr/bin/env node

import { IConfig,mian } from './ddns';
import { getArgv, getDomain } from './utils/getArgv';
import { log,logConfig } from './utils/log';
import { printLocalNetwork } from './utils/printLocalNet';

export {IConfig,mian,logConfig};
    
logConfig.debug = true;// 是否输出日志信息

async function init(){
    const config = {} as IConfig;
    config.AccessKey = getArgv('AccessKey') as string;
    config.AccessKeySecret = getArgv('AccessKeySecret') as string;
    config.IPVersion = getArgv('ip') as any || '4';
    config.DomainObj = getDomain(getArgv('Domain'));
    config.Domain = config.DomainObj.domain;
    config.Ethernets = config.DomainObj.ethernet;

    const r = await mian(config);
    if(r) {
        log('---成功---');
    }else{
        log('---失败---');
    }
}

if(getArgv('e') === 'true') {
    printLocalNetwork();
    log('---开始---');
    init();
}
