const getErrorSchema = (code: number) => ({
    type: 'object',
    properties: {
      status: {
        type: 'integer',
        enum: [code]
      },
      message: {
        type: 'string'
      },
      result: {
        type: 'string',
        enum: ['error']
      }
    },
    required: ['status']
  }),
  BadRequestSchema = getErrorSchema(400),
  UnauthorizedSchema = getErrorSchema(401),
  ForbiddenSchema = getErrorSchema(403),
  NotFoundSchema = getErrorSchema(404),
  MethodNotAllowedSchema = getErrorSchema(405),
  ConflictSchema = getErrorSchema(409),
  InternalServerErrorSchema = getErrorSchema(500);

export {
  BadRequestSchema,
  UnauthorizedSchema,
  ForbiddenSchema,
  NotFoundSchema,
  MethodNotAllowedSchema,
  ConflictSchema,
  InternalServerErrorSchema
};
