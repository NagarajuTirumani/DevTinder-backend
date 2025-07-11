const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const {
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
} = process.env;

const client = new S3Client({
  region: AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const getSignedUrlFromImgId = async (user) => {
  const command = new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: user.imgId,
  });
  const imgUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  return imgUrl;
};

module.exports = { getSignedUrlFromImgId };
