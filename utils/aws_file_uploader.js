const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

const response_handler = require("../utils/response_handler");

const aws_S3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
});


// MIME type resolver
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    pdf: 'application/pdf'
  };
  return types[ext] || 'application/octet-stream';
}

const awsFileUpload = async (file_name, image_url, BUCKET_NAME) => {
  const fileBase64 = image_url;
  const base64Data = Buffer.from(fileBase64.replace(/^data:.*;base64,/, ''), 'base64');
  const fileKey = `${uuid()}-${file_name}`;
  const key = `user-file/${fileKey}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: base64Data,
    ContentEncoding: 'base64',
    ContentType: getMimeType(file_name),
  };
  await aws_S3.upload(params).promise();
  return fileKey;
};


const awsFileFetch = async (file_name, BUCKET_NAME) => {
  const key = `user-file/${file_name}`;

  //Get Static Url
  const staticUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  // Fetch Signed Url
  const signedUrl = await aws_S3.getSignedUrlPromise('getObject', {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: 180
  });

  const result = {
    static_url: staticUrl,
    signed_url: signedUrl
  };
  return result;
};

const awsDeleteFile = async (file_name, BUCKET_NAME) => {
  const key = `user-file/${file_name}`;
  await aws_S3.deleteObject({ Bucket: BUCKET_NAME, Key: key }).promise();
  console.log("File deleted from AWS S3.")
};

module.exports = { awsFileUpload, awsFileFetch, awsDeleteFile }