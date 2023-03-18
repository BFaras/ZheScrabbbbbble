import { MAX_NUMBER_TO_PUT_0_BEFORE, TWO_DIGIT_TIME_VALUE } from '@app/constants/time-format-constants';
import { Service } from 'typedi';

@Service()
export class TimeFormatterService {
    getTimeStampString(): string {
        const date = new Date();
        return date.toLocaleString('en-US', {
            hour: TWO_DIGIT_TIME_VALUE,
            minute: TWO_DIGIT_TIME_VALUE,
            second: TWO_DIGIT_TIME_VALUE,
            hour12: false,
        });
    }

    getDateString(): string {
        const date = new Date();
        const month = date.getMonth() + 1; // getMonth() is zero-based
        const day = date.getDate();
        const year = date.getFullYear();

        return [year, (month > MAX_NUMBER_TO_PUT_0_BEFORE ? '' : '0') + month, (day > MAX_NUMBER_TO_PUT_0_BEFORE ? '' : '0') + day].join('-');
    }
}
