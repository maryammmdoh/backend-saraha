import { hash, compare } from 'bcrypt';
export async function hashOperation({plainValue,rounds = SALT_ROUNDS}) {

    return await hash(String(plainValue), rounds);
}

export async function compareOperation({plainValue,hashvalue}) {
    return await compare(String(plainValue), String(hashvalue));
}