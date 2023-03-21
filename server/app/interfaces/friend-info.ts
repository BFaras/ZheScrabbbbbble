import { ObjectId } from 'mongodb';

export interface FriendsDB {
    _id: ObjectId;
    friendsId: string[];
}

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
