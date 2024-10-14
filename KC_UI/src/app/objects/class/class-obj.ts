export class ClassObj {
    constructor(
        public classId: number,
        public className: string,
        public classDescription: string,
        public isActive: boolean,
        public createdBy: string,
        public accountId?: number
    ){}
}
