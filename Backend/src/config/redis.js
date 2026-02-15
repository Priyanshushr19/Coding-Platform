import { createClient } from 'redis';

const redisClient = createClient({
    username: 'default',
    password: 'fhaoDVe2IrGE9YDf2mzArBOOoSpL984d',
    socket: {
        host: 'redis-15039.crce220.us-east-1-4.ec2.cloud.redislabs.com',
        port: 15039
    }
});

export default redisClient;