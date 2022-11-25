"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const generateOtp = (size) => {
    const zeros = '0'.repeat(size - 1);
    const x = parseFloat('1' + zeros);
    const y = parseFloat('9' + zeros);
    return String(Math.floor(x + Math.random() * y));
};
exports.generateOtp = generateOtp;
