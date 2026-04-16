import { ENCRYPTION_KEY } from "../../../Config/config.service.js";
import  CryptoJS  from 'crypto-js';

export function encryptvalue({value, key = ENCRYPTION_KEY}){
    return CryptoJS.AES.encrypt(value, key).toString();
}

export function decryptValue({encryptedValue, key = ENCRYPTION_KEY}){
    const bytes = CryptoJS.AES.decrypt(encryptedValue, key);
    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedValue;
}

