export let logConfig = {
    debug:true
}
export function log(a1: any, a2?: any, a3?: any, a4?: any) {

    if (logConfig.debug) {

        console.log(`${Date.now().toFixed(1)} => ${a1}${getText(a2)}${getText(a3)}${getText(a4)}`);
    }
}

function getText(t: any) {
    if (t === undefined) {
        return '';
    }
    if (typeof t === 'string') {
        return ',' + t;
    } else {
        return ',' + JSON.stringify(t);
    }
}