
import 'dotenv/config';
import * as joi from 'joi';

/*
 Using joi in order to validate env variables before starting the app at all.
 */

interface EnvVars {
    PORT: number,
    STRIPE_SECRET_KEY: string,
    STRIPE_WEBHOOK_SECRET: string,
    STRIPE_SUCCESS_URL: string,
    STRIPE_CANCEL_URL: string,
    NATS_SERVERS: string[]
}

const envsSchema = joi.object<EnvVars>({
    PORT: joi.number().required(),
    STRIPE_SECRET_KEY: joi.string().required(),
    STRIPE_WEBHOOK_SECRET: joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required()
}).unknown(true);

const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
    PORT: envVars.PORT,
    STRIPE_SECRET_KEY: envVars.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: envVars.STRIPE_WEBHOOK_SECRET,
    STRIPE_SUCCESS_URL: envVars.STRIPE_SUCCESS_URL,
    STRIPE_CANCEL_URL: envVars.STRIPE_CANCEL_URL,
    NATS_SERVERS: envVars.NATS_SERVERS
}
