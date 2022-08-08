import user from './user/documentation';

const NAME = process.env.NAME || 'itiergarten',
  ErrorSchema = {
    type: 'object',
    properties: {
      status: {
        type: 'integer',
        minimum: 100,
        maximum: 999
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
  },
  getErrorSchema = (code: number) => ({
    allOf: [
      {
        $ref: '#/components/schemas/Error'
      },
      {
        properties: {
          status: {
            enum: [code]
          }
        }
      }
    ]
  }),
  BadRequestSchema = getErrorSchema(400),
  UnauthorizedSchema = getErrorSchema(401),
  ForbiddenSchema = getErrorSchema(403),
  NotFoundSchema = getErrorSchema(404),
  MethodNotAllowedSchema = getErrorSchema(405),
  ConflictSchema = getErrorSchema(409),
  InternalServerErrorSchema = getErrorSchema(500);

export default {
  openapi: '3.0.0',
  servers: [
    {
      url: '/api'
    }
  ],
  info: {
    title: 'ITiergarten API Documentation',
    description: 'Documentation of the various ITiergarten REST APIs',
    version: '1.0.0'
  },
  components: {
    parameters: {},
    responses: {
      BadRequest: {
        description: 'The server could not understand the request due to invalid syntax.',
        content: {
          'application/json': {
            schema: BadRequestSchema
          }
        }
      },
      Unauthorized: {
        description: 'The client must authenticate itself to get the requested response',
        content: {
          'application/json': {
            schema: UnauthorizedSchema
          }
        }
      },
      Forbidden: {
        description: 'The client does not have access rights to the content',
        content: {
          'application/json': {
            schema: ForbiddenSchema
          }
        }
      },
      NotFound: {
        description: 'The server can not find the requested resource',
        content: {
          'application/json': {
            schema: NotFoundSchema
          }
        }
      },
      MethodNotAllowed: {
        description: 'The request method is known by the server but is not supported by the target resource',
        content: {
          'application/json': {
            schema: MethodNotAllowedSchema
          }
        }
      },
      Conflict: {
        description: 'This response is sent when a request conflicts with the current state of the server',
        content: {
          'application/json': {
            schema: ConflictSchema
          }
        }
      },
      InternalServerError: {
        description: 'The server has encountered a situation it does not know how to handle',
        content: {
          'application/json': {
            schema: InternalServerErrorSchema
          }
        }
      }
    },
    schemas: {
      Error: ErrorSchema
    },
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: `${NAME}-jwt`
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    ...user
  }
};
