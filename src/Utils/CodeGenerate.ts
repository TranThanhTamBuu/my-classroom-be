import { Module } from "@nestjs/common";

@Module({
    exports: [CodeGenerate]
})


export class CodeGenerate {
    genCode(len: number) {
        let code = '';
        const possible =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

        for (let i = 0; i < len; i++)
            code += possible.charAt(Math.floor(Math.random() * possible.length));

        return code;
    }
}