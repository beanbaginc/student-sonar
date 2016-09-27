#!/usr/bin/env python

import json

import boto.dynamodb
import boto.sqs
from boto.sqs.message import RawMessage


def main():
    sqs_cnx = boto.sqs.connect_to_region('us-east-1')
    db_cnx = boto.dynamodb.connect_to_region('us-east-1')

    queue = sqs_cnx.get_queue('reviewboard-slack-logs')
    queue.set_message_class(RawMessage)

    table = db_cnx.get_table('reviewboard-slack-logs')

    while 1:
        messages = queue.get_messages(num_messages=10, wait_time_seconds=10)
        to_delete = []

        if messages:
            for message in messages:
                body = message.get_body()

                try:
                    data = json.loads(body)
                    attrs = {
                        key: value
                        for key, value in data.iteritems()
                        if value != ''
                    }
                except ValueError:
                    print '??? %r' % body
                    continue

                item = table.new_item(
                    hash_key=data['channel_name'],
                    range_key=data['timestamp'],
                    attrs=attrs)

                print data['timestamp']
                item.put()
                to_delete.append(message)

            sqs_cnx.delete_message_batch(queue, messages)
        else:
            break


if __name__ == '__main__':
    main()
