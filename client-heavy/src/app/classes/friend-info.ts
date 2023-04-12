export enum ConnectivityStatus {
    OFFLINE,
    ONLINE,
    INGAME,
}

export interface UserStatus {
    userId: string;
    status: ConnectivityStatus;
}

export interface Friend {
    username: string;
    status: ConnectivityStatus;
}