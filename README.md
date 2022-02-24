# ddns-ali

提供阿里云的DDNS设置，支持多网卡多域名绑定。

## 特性

- 支持阿里云DDNS设置
- 支持针对多个线路多个网卡单独设置域名
- 支持IPv4,IPv6
- 支持Docker
## 说明
每次运行时，会打印本地适配器信息，推荐根据网卡名绑定域名

必须在阿里云后台建立域名，`记录值`填写什么无所谓。

阿里云AccessKey开通：https://help.aliyun.com/document_detail/38738.html

node版本>=16

## 安装方式

```
npm i -g ddns-ali 
```

## 命令执行

参数之间只能有一个空格, 如果是win环境需要在powershell中执行。

多网卡绑定多域名方式：

``` sh
ddns-ali -e true -AccessKey 123 -AccessKeySecret 123 -Domain 'eth0&eth0.xxx.com,eth1&eth1.xxx.com'
```

单域名方式
不指定网卡，会根据你当前的外网IP动态绑定，如果支持IPv6,会优先绑定
``` sh
ddns-ali -e true -AccessKey 123 -AccessKeySecret 123 -Domain 'eth0.xxx.com'
```

指定IPv6方式
``` sh
ddns-ali -e true -ip 6 -AccessKey 123 -AccessKeySecret 123 -Domain '网卡名&eth0.xxx.com'
```


## 程序引入方式

``` typescript
import { IConfig,mian,logConfig } from 'ddns-ali';

// logConfig.debug = true;// 是否输出日志信息

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
```

## 参数

- -e `true或false` true是命令行执行
- -Domain `'网卡名1&域名1，网卡名2&域名2'`, 网卡名与域名通过‘&’进行连接，多个域名使用','分割 
- -ip `4或6` 指定要绑定的的ip类型

## 定时执行

程序不包含定时执行，现在各种系统都有定时任务。没必要在多此一举。节省系统资源。

1. 编写一个run.sh命令文件

```
#!/bin/bash
ddns-ali -e true -AccessKey 123 -AccessKeySecret 123 -Domain 'eth0&eth0.xxx.com,eth1&eth1.xxx.com'
# read
```

2. win `计划任务中`添加 `run.sh` ，mac/linux 可以在`crontab`中添加 `run.sh`