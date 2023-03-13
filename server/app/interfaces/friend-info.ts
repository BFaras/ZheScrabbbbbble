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

export interface Friend {
    username: string;
    status: ConnectivityStatus;
}
