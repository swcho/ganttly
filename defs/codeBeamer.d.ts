/**
 * Created by sungwoo on 14. 10. 1.
 */

/**
 * codeBeamer definitions
 */

declare module cb {
    interface TItem {
        uri: string;
        name: string;
    }

    interface TParamGetProjectList {
        page: number;
        pagesize?: number; // default is 100
        category?: string;
        filter?: string;
    }

    interface TProject extends TItem {
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

    interface TTracker extends TItem {
        descFormat: string;
        description: string;
        keyName: string;
        type: TType;
    }

    interface TUser extends TItem {
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

    interface TTask extends TItem {
        descFormat: string;
        estimatedMillis: number;
        modifiedAt: string; // Date
        modifier: TUser;
        priority: TPriority;
        startDate: string; // Date
        status: TStatus;
        submittedAt: string; // Date
        submitter: TUser;
        tracker: TTracker;
        version: number;

        associations?: TAssociation[];
    }

    interface TAssociation extends TItem {
        from: TItem; // uri
        to: TItem; // uri
        type: string; // uri
        propagatingSuspects: boolean;
        description: string;
        descFormat: string;
    }

    interface ICodeBeamer {
        getProjectList(aParam:TParamGetProjectList, aCb:(err, resp?:TRespGetProjectList) => void);
        getProjectTask(aProjectUri:string, aCb:(err, resp?:TTask[]) => void);
    }
}