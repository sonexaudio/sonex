import { S3Client } from "@aws-sdk/client-s3";
import config from "../config";

const { storage: { accessKeyId, secretAccessKey, endpoint } } = config;


const s3Client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
        accessKeyId,
        secretAccessKey,
    }
});

export default s3Client;