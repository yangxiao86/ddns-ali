
import { IConfig,mian } from './ddns';
import { getArgv, getDomain } from './utils/getArgv';
import { log } from './utils/log';
import { printLocalNetwork } from './utils/printLocalNet';

export {IConfig,mian};

async function init(){
    const config = {} as IConfig;
    config.AccessKey = getArgv('AccessKey') as string;
    config.AccessKeySecret = getArgv('AccessKeySecret') as string;
    config.IPVersion = getArgv('ip') as any || '4';
    config.DomainObj = getDomain(getArgv('Domain'));
    config.Domain = config.DomainObj.domain;
    config.Ethernets = config.DomainObj.ethernet;

    printLocalNetwork();

    const r = await mian(config);
    if(r) {
        log('---成功---');
    }else{
        log('---失败---');
    }
}

if(getArgv('e') === 'true') {
    log('---开始---');
    init();
}
