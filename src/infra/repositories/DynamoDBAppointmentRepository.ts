import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { Appointment } from '../../domain/Appointment';
import { AppointmentRepository as IAppointmentRepository } from '../../domain/repositories/AppointmentRepository';

export class DynamoDBAppointmentRepository implements IAppointmentRepository {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = process.env.DYNAMO_TABLE || 'appointment-service-appointments-dev';
  }

  async save(appointment: Appointment): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...appointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    await this.client.send(command);
  }

  async update(appointmentId: string, updates: Partial<Appointment>): Promise<void> {
    const updateExpression = Object.keys(updates)
      .map((key, index) => `#${key} = :val${index}`)
      .concat('#updatedAt = :updatedAt')
      .join(', ');

    const expressionAttributeNames = Object.keys(updates).reduce(
      (acc, key) => {
        acc[`#${key}`] = key;
        return acc;
      },
      {} as Record<string, string>
    );
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    const expressionAttributeValues = Object.entries(updates).reduce(
      (acc, [key, value], index) => {
        acc[`:val${index}`] = value;
        return acc;
      },
      {} as Record<string, any>
    );
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { appointmentId },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(appointmentId)',
    });

    await this.client.send(command);
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { appointmentId },
    });

    const result = await this.client.send(command);
    return (result.Item as Appointment) ?? null;
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'InsuredIdIndex',
      KeyConditionExpression: 'insuredId = :insuredId',
      ExpressionAttributeValues: {
        ':insuredId': insuredId,
      },
    });

    const result = await this.client.send(command);
    return (result.Items ?? []) as Appointment[];
  }

  async updateStatus(appointmentId: string, status: Appointment['status']): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { appointmentId },
      UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(appointmentId)',
    });

    await this.client.send(command);
  }
}
