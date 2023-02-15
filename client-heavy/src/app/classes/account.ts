import { Question } from "./question";

export interface Account {
    username: string;
    email: string;
    password: string;
    securityQuestion: Question
}
