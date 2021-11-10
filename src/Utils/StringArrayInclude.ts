import { Module } from "@nestjs/common";

@Module({
    exports: [StringArraryUtils]
})


export class StringArraryUtils{
    IsInClude(strArr: string[], str: string) {
        for (let val of strArr) {
            if (val.toString() === str) {
                return true;
            }
        }
        return false;
    }
}