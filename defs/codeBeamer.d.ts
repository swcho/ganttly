/**
 * Created by sungwoo on 14. 10. 1.
 */

interface TParamGetProjectList {
    page: number;
    pagesize?: number; // default is 100
    category?: string;
    filter?: string;
}

interface TProject {
    uri: string;
    name: string;
    description: string;
    descFormat: string;
    category: string;
    closed: boolean;
    deleted: boolean;
}

interface TRespGetProjectList {
    page: number;
    size: number;
    total: number;
    projects: TProject[];
}


interface TTask {
    uri: string;
    name: string;
}

interface ICodeBeamer {
    getProjectList(aParam: TParamGetProjectList, aCb: (err, resp?: TRespGetProjectList) => void);
    getProjectTask(aProjectUri: string, aCb: (err, resp?: TTask[]) => void);
}