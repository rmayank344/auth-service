const AWS = require('aws-sdk');
require('dotenv').config();

const response_handler = require("../utils/response_handler");

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const sns = new AWS.SNS();
const cloudwatch = new AWS.CloudWatch();

const createSNSTopic = async (topicName) => {
  try {
    const params = {
      Name: topicName,
    };
    // console.log(params);
    const data = await sns.createTopic(params).promise();
    // console.log(data);
    // console.log('SNS Topic Created:', data.TopicArn);
    return data.TopicArn;
  }
  catch (err) {
    console.log(`Error in Create SNS Topic: ${err}`);
    return err;
  }
};

const subscribeToTopic = async (topicArn, protocol, endpoint) => {
  try {
    const params = {
      Protocol: protocol,
      TopicArn: topicArn,
      Endpoint: endpoint,
      ReturnSubscriptionArn: true,
    };
    const data = await sns.subscribe(params).promise();
    return data.SubscriptionArn;
  }
  catch (err) {
    console.log(`Error in Subscribe to topic: ${err}`);
    return err;
  }
};

const publishMessageSNSTopic = async (topicArn, message, subject) => {
  try{
    const params = {
      TopicArn: topicArn,
      Message: message,
      Subject: subject
    };

    const data = await sns.publish(params).promise();
    // console.log(data);
    return data.MessageId;
  }
  catch(err){
    console.log(`Error in Subscribe to topic: ${err}`);
    return err;
  }
};

const alertCPUAlarm = async (instanceId, topicArn) => {
  try{
    const params = {
      AlarmName: `HighCPU-${instanceId}`, // alarm name
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 1,
      MetricName: 'CPUUtilization',
      Namespace: 'AWS/EC2',
      Period: 60, // check every 1 min
      Statistic: 'Average',
      Threshold: 40, // 40% CPU threshold
      ActionsEnabled: true,
      AlarmActions: [topicArn], // SNS topic ARN here
      AlarmDescription: 'Alarm when CPU exceeds 40%',
      Dimensions: [
        {
          Name: 'InstanceId',
          Value: instanceId,
        },
      ],
      Unit: 'Percent',
    };

    
    const data = await cloudwatch.putMetricAlarm(params).promise();
    // console.log('Alarm created:', data);
    return data;
  }
  catch(err){
    console.log(`Error in Create CPU Alarm: ${err}`);
    return err;
  }
};

module.exports = { createSNSTopic, subscribeToTopic, publishMessageSNSTopic, alertCPUAlarm };