import { Injectable } from '@angular/core';
import { MAX_SECOND_VALUE, Timer } from '@app/classes/timer';
import { TIMER_VALUES } from '@app/constants/timer-constants';
import { ChatService } from '@app/services/chat-service/chat.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    currentTimer: Timer = { minute: 0, second: 0 };
    timeChosen: Timer = { minute: 1, second: 0 };
    private stopTimer: boolean = false;
    private socket: Socket;

    constructor(private chatService: ChatService, private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
        this.modifyTimer();
        this.getTimeChosen();
    }

    resetTimer() {
        this.currentTimer.minute = this.timeChosen.minute;
        this.currentTimer.second = this.timeChosen.second;
    }

    getTimer(): Timer {
        return this.currentTimer;
    }

    setTimerStopped(stopped: boolean) {
        if (!stopped) {
            this.getTimeChosen();
        }
        this.stopTimer = stopped;
    }

    getTimeChosen() {
        this.socket.emit('sendTimer');
        this.socket.on('hereIsTheTimer', (answer: Timer) => this.updateTimeChosen(answer));
    }

    updateTimeChosen(time: Timer) {
        this.resetTimer();
        this.timeChosen = time;
    }

    modifyTimer() {
        setInterval(() => {
            if (this.stopTimer) return;
            this.currentTimer.second--;
            if (this.currentTimer.second < 0) {
                this.currentTimer.second = MAX_SECOND_VALUE;
                this.currentTimer.minute--;
            }
            if (this.currentTimer.minute === 0 && this.currentTimer.second === 0) this.chatService.sendCommand('', 'Pass');
        }, TIMER_VALUES.timeJump);
    }
}
