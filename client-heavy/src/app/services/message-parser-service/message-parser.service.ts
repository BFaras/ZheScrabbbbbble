import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';

export enum MessageType {
    Normal,
    Empty,
    Pass,
    Swap,
    Place,
    Help,
    Hint,
    Reserve,
    InvalidCommand,
    InvalidArgument,
    NotTurn,
}

@Injectable({
    providedIn: 'root',
})
export class MessageParserService {
    isEmpty(message: Message): boolean {
        return message.body.trim() === '';
    }
    isCommand(message: Message): boolean {
        return message.body.charAt(0) === '!';
    }
    parseCommand(message: Message): MessageType {
        if (this.isEmpty(message)) return MessageType.Empty;
        if (!this.isCommand(message)) return MessageType.Normal;
        const splitMessage = message.body.split(' ');
        switch (splitMessage[0]) {
            case '!passer':
                if (splitMessage.length !== 1) return MessageType.InvalidArgument;
                return MessageType.Pass;
            case '!échanger':
                if (splitMessage.length !== 2) return MessageType.InvalidArgument;
                return MessageType.Swap;
            case '!placer':
                if (splitMessage.length !== 3) return MessageType.InvalidArgument;
                return MessageType.Place;
            case '!aide':
                if (splitMessage.length !== 1) return MessageType.InvalidArgument;
                return MessageType.Help;
            case '!réserve':
                if (splitMessage.length !== 1) return MessageType.InvalidArgument;
                return MessageType.Reserve;
            case '!indice':
                if (splitMessage.length !== 1) return MessageType.InvalidArgument;
                return MessageType.Hint;
        }
        return MessageType.InvalidCommand;
    }
}
