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

interface TType {
    name: string;
    url: string;
}

interface TTracker {
    descFormat: string;
    description: string;
    keyName: string;
    name: string;
    type: TType;
    uri: string;
}

interface TUser {
    uri: string;
    name: string;
}

interface TPriority {
    flags: number;
    id: number;
    name: string;
}

interface TStatus {
    flags: number;
    id: number;
    name: string;
}

interface TTask {
    uri: string;

    descFormat: string;
    estimatedMillis: number;
    modifiedAt: string; // Date
    modifier: TUser;
    name: string;
    priority: TPriority;
    startDate: string; // Date
    status: TStatus;
    submittedAt: string; // Date
    submitter: TUser;
    tracker: TTracker;
    version: number;

    associations?: TAssociation[];
}

interface TAssociation {
    from: string; // uri
    to: string; // uri
    type: string; // uri
    propagatingSuspects: boolean;
    description: string;
    descFormat: string;
}

interface ICodeBeamer {
    getProjectList(aParam: TParamGetProjectList, aCb: (err, resp?: TRespGetProjectList) => void);
    getProjectTask(aProjectUri: string, aCb: (err, resp?: TTask[]) => void);
}