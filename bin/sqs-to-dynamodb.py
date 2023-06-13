#!/usr/bin/env python

import json

import boto3


def main():
    dynamodb = boto3.resource('dynamodb')
    sqs = boto3.resource('sqs')

    queue = sqs.get_queue_by_name(QueueName='reviewboard-slack-logs')
    table = dynamodb.Table('reviewboard-slack-logs')

    with table.batch_writer() as batch:
        for message in queue.receive_messages(WaitTimeSeconds=10):
            try:
                data = json.loads(message.body)

                batch.put_item(Item={
                    key: value
                    for key, value in data.items()
                    if value != ''
                })

                message.delete()
            except ValueError:
                print('??? %r' % message.body)


if __name__ == '__main__':
    main()
