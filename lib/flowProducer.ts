import { FlowProducer } from 'bullmq';
import {connection} from './redis'

export const flowProducer = new FlowProducer({
    connection,
});
