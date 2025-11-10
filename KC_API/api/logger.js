// const { CloudWatchLogsClient, PutLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');
// const winston = require('winston');
// const { combine, timestamp, printf } = winston.format;

// const logFormat = printf(({ level, message, timestamp }) => {
//     return `${timestamp} [${level}]: ${message}`;
// });

// const cloudWatchClient = new CloudWatchLogsClient({ region: 'us-east-1' });

// const logger = winston.createLogger({
//     level: 'info',
//     format: combine(
//         timestamp(),
//         logFormat
//     ),
//     transports: [
//         new winston.transports.File({ filename: 'error.log', level: 'error' }),
//         new winston.transports.File({ filename: 'combined.log' }),
//         new winston.transports.Console({
//             format: combine(
//                 winston.format.colorize(),
//                 logFormat
//             )
//         })
//     ]
// });

// if (process.env.NODE_ENV === 'production') {
//     // Attempt to add CloudWatch push. If the transport construction fails on the
//     // instance (different winston version/constructor), fall back to Console so
//     // the app doesn't crash and logs still appear in EB logs.
//     try {
//         // Use Console transport in production as a safe default. This avoids
//         // startup crashes if the Stream transport is incompatible on the host.
//         logger.add(new winston.transports.Console({
//             format: combine(
//                 timestamp(),
//                 logFormat
//             )
//         }));
//         // Note: push-to-CloudWatch can be implemented here if desired and the
//         // instance role has permissions. For now we avoid adding a custom
//         // Stream transport that may not be supported in all environments.
//     } catch (err) {
//         console.error('Failed to add production logger transport, continuing without CloudWatch transport', err);
//     }
// }

// module.exports = logger;
