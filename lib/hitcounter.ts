import * as cdk from '@aws-cdk/core';
import * as lamdba from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface HitCounterProps {
  downstream: lamdba.IFunction
}

export class HitCounter extends cdk.Construct {

  public readonly handler: lamdba.Function;

  public readonly table: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id)

    this.table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    this.handler = new lamdba.Function(this, 'HitCounterHandler', {
      runtime: lamdba.Runtime.NODEJS_10_X,
      handler: 'hitcounter.handler',
      code: lamdba.Code.fromAsset('lambda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: this.table.tableName
      }
    });

    this.table.grantReadWriteData(this.handler);
    props.downstream.grantInvoke(this.handler);
  }
}
