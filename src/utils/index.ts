import fs = require('fs')
import path = require('path')
import jwt = require('jsonwebtoken');
import os = require('os')
const publicKey = fs.readFileSync(path.resolve(__dirname, './public.key'))
const utlisData = require(path.resolve(__dirname, '../utils/data.json'))
import { TokenData, Dict, UserData } from '../interface-data/index'

const isArray = (data: any): boolean => {
    return Object.prototype.toString.call(data) === '[object Array]'
}
module.exports = {
    verifyToken(token: string): TokenData {
        let res: TokenData
        try {
            const result: TokenData = jwt.verify(token, publicKey, {
                algorithms: ['RS256']
            })
            res = result
        } catch (err) {
            // console.log(err)
        }
        // 这里校验了token是否有效。没有校验数据库是否还有这个用户
        return res
    },
    joinArray(key: string[], data: any): any {
        const retData: any = {
            ...data
        }
        if (!isArray(key)) {
            return retData
        }
        key.forEach(v => {
            if (!retData[v]) {
                retData[v] = null
            }
            if (isArray(retData[v])) {
                retData[v] = JSON.stringify(retData[v])
            }
        })
        return retData
    },
    toLiteral(str: string): string {
        const dict: Dict = {'\b': 'b', '\t': 't', '\n': 'n', '\v': 'v', '\f': 'f', '\r': 'r'};
        return str.replace(/([\\'"\b\t\n\v\f\r])/g, function ($0, $1) {
            return '\\' + (dict[$1] || $1);
        });
    },
    getIPAdress() {  
        const interfaces = os.networkInterfaces()
        // const sysType = os.type() === 'Linux' ? '' : ':9008'
        for(var devName in interfaces){  
              var iface = interfaces[devName]
              for(var i=0;i<iface.length;i++){  
                   var alias = iface[i]
                   if(alias.family === 'IPv4' && !alias.internal){  
                         return alias.address
                   }  
              }  
        }  
    },
    getIp(): string {
        const sysType: string = os.type()
        return sysType === 'Linux' ? '39.108.184.64' : this.getIPAdress() + ':9008'
    }
}