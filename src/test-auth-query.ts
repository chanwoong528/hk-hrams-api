import * as http from 'http';
import * as crypto from 'crypto';

function createToken(payload: object, secret: string): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

const token = createToken({ sub: '20d3cfee-e07a-4208-929e-e8a0aa041fbb', exp: Math.floor(Date.now() / 1000) + 3600 }, 'abcdef');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/appraisal-team-members?departments=b1473cb9-f656-4ec2-9aa8-4920a916319d',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Response:', data));
});

req.on('error', (e) => console.error('Error:', e));
req.end();
