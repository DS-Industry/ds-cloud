export class BulkWriteResult {
  ok: number;
  writeErrors: any[];
  writeConcernErrors: any[];
  insertedIds: any[];
  nInserted: number;
  nUpserted: number;
  nMatched: number;
  nRemoved: number;
  upserted: any[];
  opTime: any;
}
