import * as shell from 'shelljs';
import { resolve } from 'path';

let r;
const SECRET_PATH = resolve(process.cwd(), 'keys/ecdsa-p521-secret.pem');
const PUBLIC_PATH = resolve(process.cwd(), 'keys/ecdsa-p521-public.pem');

shell.mkdir('-p', resolve(process.cwd(), 'keys'));

if (shell.test('-f', SECRET_PATH)) {
    shell.echo('Error: secret key already exists');
    shell.exit(1);
}

if (shell.test('-f', PUBLIC_PATH)) {
    shell.echo('Error: public key already exists');
    shell.exit(1);
}

r = shell.exec(
    `openssl ecparam -genkey -name secp521r1 -noout -out ${SECRET_PATH}`,
);
if (r.code !== 0) {
    shell.echo('Error: failed to create secret key');
    shell.exit(1);
}

r = shell.exec(
    `openssl ec -in ./keys/ecdsa-p521-secret.pem -pubout -out ${PUBLIC_PATH}`,
);
if (r.code !== 0) {
    shell.echo('Error: failed to create public key');
    shell.exit(1);
}

shell.echo(`Secret key: ${SECRET_PATH}`);
shell.echo(`Public key: ${PUBLIC_PATH}`);
shell.exit(0);
