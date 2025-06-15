export function embedMessage(audioData: Uint8Array, message: string): Uint8Array {
    const bits = textToBits(message + '\0');
    const result = new Uint8Array(audioData);

    for (let i = 44, j = 0; i < result.length && j < bits.length; i++) {
        result[i] = (result[i] & 0b11111110) | bits[j];
        j++;
    }

    return result;
}

export function extractMessage(audioData: Uint8Array): string {
    const bits: number[] = [];
    for (let i = 44; i < audioData.length; i++) {
        bits.push(audioData[i] & 1);
        if (bits.length % 8 === 0) {
            const char = bitsToChar(bits.slice(-8));
            if (char === '\0') break;
        }
    }
    return bitsToText(bits);
}

function textToBits(text: string): number[] {
    return text.split('')
        .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('')
        .split('')
        .map(bit => parseInt(bit));
}

function bitsToChar(bits: number[]): string {
    return String.fromCharCode(parseInt(bits.join(''), 2));
}

function bitsToText(bits: number[]): string {
    const chars = [];
    for (let i = 0; i < bits.length; i += 8) {
        const byte = bits.slice(i, i + 8);
        const char = bitsToChar(byte);
        if (char === '\0') break;
        chars.push(char);
    }
    return chars.join('');
}
