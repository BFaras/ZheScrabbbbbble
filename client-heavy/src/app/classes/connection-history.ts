import { ConnectionInfo } from "./profileInfo";

export interface connectionHistory {
    connections: ConnectionInfo[];
    disconnections: ConnectionInfo[];
}
