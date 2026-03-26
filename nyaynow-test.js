import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 50 },   // warm up
        { duration: '1m', target: 100 },   // normal load
        { duration: '1m', target: 200 },   // stress
        { duration: '30s', target: 0 },    // cool down
    ],
};

export default function () {
    let res = http.get('https://nyaynow.in/');
    sleep(1);
}