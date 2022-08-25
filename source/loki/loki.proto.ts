import { Field, Message, Type } from 'protobufjs';

import { LokiEntry, LokiMessage, LokiStream, LokiTimestamp } from './loki.interface';

@Type.d('LokiTimestampProto')
export class LokiTimestampProto extends Message<LokiTimestampProto> implements LokiTimestamp {

  @Field.d(1, 'int64', 'required')
  public seconds: number;

  @Field.d(2, 'int32', 'required')
  public nanos: number;

}

@Type.d('LokiEntryProto')
export class LokiEntryProto extends Message<LokiEntryProto> implements LokiEntry {

  @Field.d(1, LokiTimestampProto, 'required')
  public timestamp: LokiTimestamp;

  @Field.d(2, 'string', 'required')
  public line: string;

}

@Type.d('LokiStreamProto')
export class LokiStreamProto extends Message<LokiStreamProto> implements LokiStream {

  @Field.d(1, 'string', 'required')
  public labels: string;

  @Field.d(2, LokiEntryProto, 'repeated')
  public entries: LokiEntry[];

}

@Type.d('LokiMessageProto')
export class LokiMessageProto extends Message<LokiMessageProto> implements LokiMessage {

  @Field.d(1, LokiStreamProto, 'repeated')
  public streams: LokiStream[];

}
