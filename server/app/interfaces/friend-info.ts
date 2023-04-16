import { ObjectId } from 'mongodb';

export interface FriendsDB {
    _id: ObjectId;
    friendsId: string[];
}

export enum ConnectivityStatus {
    OFFLINE = 0,
    ONLINE = 1,
    INGAME = 2,
}

export interface UserStatus {
    userId: string;
    status: ConnectivityStatus;
}

export interface Friend {
    username: string;
    status: ConnectivityStatus;
}
