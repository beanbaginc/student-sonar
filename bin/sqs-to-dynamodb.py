#!/usr/bin/env python

import json

import boto.sqs
from boto.dynamodb2.table import Table
from boto.sqs.message import RawMessage


def main():
    sqs_cnx = boto.sqs.connect_to_region('us-east-1')
    queue = sqs_cnx.get_queue('reviewboard-slack-logs')
    queue.set_message_class(RawMessage)

    table = Table('reviewboard-slack-logs')

    while 1:
        messages = queue.get_messages(num_messages=10, wait_time_seconds=10)
        to_delete = []

        if messages:
            with table.batch_write() as batch:
                for message in messages:
                    body = message.get_body()

                    try:
                        data = json.loads(body)
                        attrs = {
                            key: value
                            for key, value in data.iteritems()
                            if value != ''
                        }

                        print data['timestamp']
                        batch.put_item(attrs)
                        to_delete.append(message)
                    except ValueError:
                        print '??? %r' % body

            sqs_cnx.delete_message_batch(queue, messages)
        else:
            break


if __name__ == '__main__':
    main()
