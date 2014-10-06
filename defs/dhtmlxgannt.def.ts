
interface TDhxTask {
    id: string;
    text?: string;
    start_date?: Date
    duration?: number;
    order?: number;
    progress?: number;
    open?: boolean;
    parent?: string;
}

interface TDhxLink {
    id: string;
    source: string;
    target: string;
    type: string;
}

interface TDhxData {
    tasks: TDhxTask[];
    links: TDhxLink[];
}