export class Letter {
    private char: string;
    private value: number;

    constructor(char: string, value: number) {
        this.char = char;
        this.value = value;
    }

    changeBlank(char: string) {
        if (this.char === 'blank') this.char = char;
    }

    revertBlank() {
        if (this.value === 0) this.char = 'blank';
    }

    getChar(): string {
        return this.char;
    }
    getValue(): number {
        return this.value;
    }
}
