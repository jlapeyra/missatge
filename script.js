function str2bin(x) {
    return [...x].map(b => parseInt(b));
}

function bin2str(x) {
    return x.map(String).join('');
}

function mod(x, m) {
    return (x%m + m) % m
}
  
// BigInt
function int2bin(x, size) {
    let ret = [];
    for (let _ = 0; _ < size; _++) {
        ret.push(Number(mod(x, 2n)));
        x = x / 2n; //floor
    }
    return ret.reverse();
}
function bin2int(x) {
    let ret = 0n;
    for (let b of x) {
        ret = ret*2n + BigInt(b);
    }
    return ret;
}

//Number
function int2bin_short(x, size) {
    let ret = [];
    for (let _ = 0; _ < size; _++) {
        ret.push(mod(x, 2));
        x = Math.floor(x / 2);
    }
    return ret.reverse();
}
function bin2int_short(x) {
    let ret = 0;
    for (let b of x) {
        ret = ret*2 + b;
    }
    return ret;
}

function text2bin(text) {
    let ret = []
    for (let i = 0; i < text.length; i++) {
        ret.push(...int2bin_short(text.codePointAt(i), 8));
    }
    return ret
}
function bin2text(bin) {
    let codePoints = []
    for (let i = 0; i < bin.length; i += 8) {
        codePoints.push(bin2int_short(bin.slice(i, i+8)))
    }
    return String.fromCodePoint(...codePoints)
}


class EncryptType {
    static encrypt(x, key) {
        // Placeholder
    }
    static decrypt(x, key) {
        // Placeholder
    }
}

class XOR extends EncryptType {
    static encrypt(x, key) {
        return int2bin(bin2int(x) ^ key, x.length);
    }
    static decrypt(x, key) {
        return int2bin(bin2int(x) ^ key, x.length);
    }
}

class Add extends EncryptType {
    static encrypt(x, key) {
        return int2bin(mod(bin2int(x) + key, 1n << BigInt(x.length)), x.length);
    }
    static decrypt(x, key) {
        return int2bin(mod(bin2int(x) - key, 1n << BigInt(x.length)), x.length);
    }
}

class Shift extends EncryptType {
    static simpleKey(key) {
        return Number(key % (2n<<8n))
    }
    static encrypt(x, key) {
        return x.map((_, i) => x[mod((i - Shift.simpleKey(key)), x.length)]);
    }
    static decrypt(x, key) {
        return x.map((_, i) => x[mod((i + Shift.simpleKey(key)), x.length)]);
    }
}

class Encryption {
    constructor(type, size, key) {
        this.encryptor = type;
        this.size = size;
        this.key = key;
    }

    __crypt(bits, action) {
        let ret = [];
        for (let i = 0; i < bits.length; i += this.size) {
            ret.push(...action(bits.slice(i, i + this.size), this.key));
        }
        return ret;
    }

    encrypt(bits) {
        return this.__crypt(bits, this.encryptor.encrypt);
    }

    decrypt(bits) {
        return this.__crypt(bits, this.encryptor.decrypt);
    }
}

/*function test() {
    for (const size of [5,10,20,30,50,60]) {
        for (const k of [0.3, 0.10, 0.30, 0.66, 0.77]) {
            key = BigInt(Math.abs(Math.floor(k*(1 << size))))
            type = Add
            console.log(size, key, type);
            e = new Encryption(type, size, key)
            for (let x = 1; x < Math.pow(2, 63); x *= 1.42) {
                plain = int2bin(BigInt(Math.floor(x)), 40)
                encrypted = e.encrypt(plain)
                decrypted = e.decrypt(encrypted)
                //console.log(bin2str(int2bin(key, size)), bin2str(plain), bin2str(encrypted), bin2str(decrypted))
                if (bin2str(plain) != bin2str(decrypted)) {
                    console.log('ERROR', bin2str(plain), '!=' ,bin2str(decrypted));
                }
            }
        }
    }
}*/




function getEncoding(clau) {
    let keys = transformaClau(clau)
    let ret = []
    const types = [XOR, Add, Shift]
    for (let i = 0; i < keys.length; i += 2) {
        let key = keys[i] + 1
        if (i+1 < keys.length) size = keys[i+1] + 4;
        else size = 8;
        let type = types[(i/2)%3]
        if (type != Shift) {
            key = 3 + key*7
            size = 4 + (size)%8
            //size = 5 + (size)%10
        }
        ret.push(new Encryption(type, size, BigInt(key)))
    }
    return ret
}

function encodeText(text, encodings) {
    let bits = text2bin(text)
    for (const encoding of encodings) {
        bits = encoding.encrypt(bits)
    }
    return bin2text(bits)
}


function decodeText(text, encodings) {
    let bits = text2bin(text)
    for (const encoding of encodings.reverse()) {
        bits = encoding.decrypt(bits)
    }
    return bin2text(bits)
}

function unidecode(c) {
    if ('àáä'.includes(c)) return 'a'
    if ('èéë'.includes(c)) return 'e'
    if ('ìíï'.includes(c)) return 'i'
    if ('òóö'.includes(c)) return 'o'
    if ('ùúü'.includes(c)) return 'u'
    return c
}

function transformaClau(clau) {
    return [...clau.toLowerCase()]
    .map(unidecode)
    .filter(c => c.match(/[a-zçñ]/))
    .map(c => c.codePointAt(0))
    //return [...clau].map(c => c.codePointAt(0))
}
    
//const xifrat = 'Þ\x83É¨\x823Ý·é¡\x87²`Òÿ*\x0FQÑÎ³4W«Üí·\x16]íäZ\'øã\x18¢Ò-çðg¢(\x84j\x86\x86Þ6\x87Â\x83#cjê\x9F\x10©\rw¿/@Ý0\x11\x00\x14O\x11\x05\x14ñÅÌ-4ðÑ\x032@±bÚ0\x86`Ä<³\'\x1F¦»GÊÛåU>¼\x1E\x80´\x01Î²2ïí\x17\x97ØëÖ·?§\x8A\x9A^7ü"ÑÁ\x988\\â\x85áÑG3IÔÇ\x973Á¥Ì\x19cIê%kc\x9C-ÎÚ,í\x0F1ÎÌÜ_|\x9Fh·b7ýñÔ9=\x1A\\b-öhavªþx\x06_ù\x07µ\x8E\x03ÚX¼ºkv\x0FéX\x94ÇÑîw\x98Þz\x11\x7F¦³{$`²\x13\x985á/Ìó\x1FÀ\x1D\t1\x0Fl\x9E\x92\x89F\x9A§»\x18\x95*\x15\x80i\x12'


const xifrats = {
    'am' : 'ôq\x8D\x8Fæ\x8F¾Ýì\x9BÅ\x8C\x9CJ\b<«#7GË®üæ\x10ú\x11\x16\x17<n\x04={)|Û\x87lÖ"ï×7\x9EÐ\x0E#P,\x13ö\x18ä\x8BIúcÿK\x9F\x1B.§\x0F\rá£hyg\x18D\bÍ*\x0EÞ\x95á\x0FM¾ÂÙàøR#;[\x13pT]\x01\x1A)\n;5Õ\x9A+\x18I\x12ÆÐá¶F\x9B#\x00´ÿ\x88rÈl\x86õÅ(\x1C\x1D\x02¦\x8C\x12ÞN\x98:Ti\x80?¯\x91Ã\x1BJ\x14\x86zV\x0F¤zÅ\x907\x85\x07ië\x8B|Úµ@Õ×\vID\x92\x91·võ"\x9Aà\x1A\x026JÕÓè¶{³ß/ªÑ\x14Î\x1B\bá\x13îÙÐÑñØE1Ñòÿ\x8E³ê\x7F%J>è\x9C7î>@\x92\x01NÅq\x15-®õê&bW¡¶g§\x8C.\x1E¯Ñ()¬Q\x90',
    'sc' : 'P!rSä2RO>=½\x87Ð\x91N| eÉý\x8Eº×û)',
}

function desxifra(clau, ident) {
    let xifrat = xifrats[ident]
    if (xifrat) {
        return decodeText(xifrat, getEncoding(clau))
    }
    else {
        return ''
    }
}
