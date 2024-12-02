import { fromIni } from "@aws-sdk/credential-providers";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE }),
};
